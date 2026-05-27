import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import { createAdminClient } from '@sellio/db/admin';
import { getPaymentProvider } from '@sellio/payments';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('x-event-checksum');

    // Initialize Wompi payment provider (CO)
    const provider = getPaymentProvider('CO');
    const verification = provider.verifyWebhook(rawBody, signatureHeader);

    if (!verification.ok) {
      console.warn('[Wompi Webhook] Signature verification failed:', verification.reason);
      Sentry.addBreadcrumb({
        category: 'wompi.webhook',
        level: 'warning',
        message: 'Signature verification failed',
        data: { reason: verification.reason },
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event } = verification;
    const db = createAdminClient();

    // 1. Check if the event was already registered/processed
    const { data: existingEvent, error: findEventErr } = await db
      .from('webhook_events')
      .select('id, processed_at')
      .eq('provider', 'wompi')
      .eq('event_id', event.eventId)
      .maybeSingle();

    if (findEventErr) {
      console.error('[Wompi Webhook] Error checking existing event:', findEventErr);
      Sentry.captureException(findEventErr, { tags: { provider: 'wompi' }, extra: { eventId: event.eventId } });
      return NextResponse.json({ error: 'DB Error' }, { status: 500 });
    }

    if (existingEvent) {
      if (existingEvent.processed_at) {
        console.log('[Wompi Webhook] Event already processed:', event.eventId);
        return NextResponse.json({ ok: true, message: 'Already processed' });
      }
      // If it exists but processed_at is null, we proceed with retry processing
      console.log('[Wompi Webhook] Retrying unprocessed event:', event.eventId);
    } else {
      // Record new webhook event as unprocessed (processed_at = null)
      const { error: insertWebhookErr } = await db.from('webhook_events').insert({
        provider: 'wompi',
        event_id: event.eventId,
        event_type: event.eventType,
        payload: JSON.parse(rawBody),
        processed_at: null,
      });

      if (insertWebhookErr) {
        if (insertWebhookErr.code === '23505') {
          // Handled concurrent insertions gracefully
          const { data: concurrentEvent } = await db
            .from('webhook_events')
            .select('processed_at')
            .eq('provider', 'wompi')
            .eq('event_id', event.eventId)
            .maybeSingle();
          if (concurrentEvent?.processed_at) {
            return NextResponse.json({ ok: true, message: 'Already processed' });
          }
        } else {
          console.error('[Wompi Webhook] Error recording event:', insertWebhookErr);
          Sentry.captureException(insertWebhookErr, { tags: { provider: 'wompi' }, extra: { eventId: event.eventId } });
          return NextResponse.json({ error: 'DB Error' }, { status: 500 });
        }
      }
    }

    let businessError: any = null;

    // 2. Handle transaction updates
    if (event.eventType === 'transaction.updated') {
      const transaction = event.data.transaction as {
        id: string;
        amount_in_cents: number;
        reference: string;
        status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
        currency: string;
      };

      if (transaction.status === 'APPROVED') {
        // Extract orgId from reference format: {orgId}_{timestamp}
        const [orgId] = transaction.reference.split('_');

        if (!orgId) {
          businessError = new Error(`Invalid reference format: ${transaction.reference}`);
        } else {
          // Determine target plan
          // $35.000 COP -> basic
          // $95.000 COP -> elite
          const plan = transaction.amount_in_cents >= 9500000 ? 'elite' : 'basic';
          const periodStart = new Date();
          const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days

          // Update organization's current plan
          const { error: updateOrgError } = await db
            .from('organizations')
            .update({ plan, trial_ends_at: null })
            .eq('id', orgId);

          if (updateOrgError) {
            businessError = updateOrgError;
          } else {
            // Fetch or create subscription record
            const { data: existingSub, error: findSubErr } = await db
              .from('subscriptions')
              .select('id')
              .eq('org_id', orgId)
              .maybeSingle();

            if (findSubErr) {
              businessError = findSubErr;
            } else {
              let subId: string | null = null;
              if (existingSub) {
                subId = existingSub.id;
                const { error: updateSubErr } = await db
                  .from('subscriptions')
                  .update({
                    plan,
                    status: 'active',
                    current_period_start: periodStart.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    cancel_at_period_end: false,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', subId);

                if (updateSubErr) {
                  businessError = updateSubErr;
                }
              } else {
                const { data: newSub, error: createSubError } = await db
                  .from('subscriptions')
                  .insert({
                    org_id: orgId,
                    plan,
                    status: 'active',
                    provider: 'wompi',
                    provider_subscription_id: `sub_${orgId}_${Date.now()}`,
                    current_period_start: periodStart.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    cancel_at_period_end: false,
                  })
                  .select('id')
                  .single();

                if (createSubError || !newSub) {
                  businessError = createSubError || new Error('Failed to create subscription record');
                } else {
                  subId = newSub.id;
                }
              }

              if (!businessError && subId) {
                // Record the payment invoice
                const { error: insertInvoiceErr } = await db.from('invoices').insert({
                  org_id: orgId,
                  subscription_id: subId,
                  amount_cents: transaction.amount_in_cents,
                  currency: transaction.currency,
                  status: 'paid',
                  provider: 'wompi',
                  provider_invoice_id: `inv_${transaction.id}`,
                  paid_at: new Date().toISOString(),
                  period_start: periodStart.toISOString(),
                  period_end: periodEnd.toISOString(),
                });

                if (insertInvoiceErr) {
                  // We log invoice error but don't fail the whole webhook since subscription is active
                  console.error('[Wompi Webhook] Error creating invoice record (non-blocking):', insertInvoiceErr);
                  Sentry.captureException(insertInvoiceErr, {
                    tags: { provider: 'wompi', nonBlocking: 'true' },
                    extra: { eventId: event.eventId, orgId, transactionId: transaction.id, subId },
                  });
                }
              }
            }
          }
        }
      } else {
        console.log(`[Wompi Webhook] Transaction processed but not approved. Status: ${transaction.status}`);
      }
    }

    if (businessError) {
      console.error('[Wompi Webhook] Business processing failed:', businessError);
      Sentry.captureException(businessError, { tags: { provider: 'wompi' }, extra: { eventId: event.eventId } });
      // Record the error description in webhook_events
      await db
        .from('webhook_events')
        .update({
          error: typeof businessError === 'string' ? businessError : (businessError.message || JSON.stringify(businessError)),
        })
        .eq('provider', 'wompi')
        .eq('event_id', event.eventId);

      return NextResponse.json({ error: 'Business logic failure' }, { status: 500 });
    }

    // 3. Mark webhook event as processed successfully
    const { error: updateWebhookErr } = await db
      .from('webhook_events')
      .update({
        processed_at: new Date().toISOString(),
        error: null,
      })
      .eq('provider', 'wompi')
      .eq('event_id', event.eventId);

    if (updateWebhookErr) {
      console.error('[Wompi Webhook] Error updating webhook event status:', updateWebhookErr);
      Sentry.captureException(updateWebhookErr, { tags: { provider: 'wompi' }, extra: { eventId: event.eventId } });
    }

    console.log(`[Wompi Webhook] Successfully processed event: ${event.eventId}`);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Wompi Webhook] Fatal error:', err);
    Sentry.captureException(err, { tags: { provider: 'wompi' } });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
