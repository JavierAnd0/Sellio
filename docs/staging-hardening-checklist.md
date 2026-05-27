# Sellio Staging Hardening Checklist

Run this before moving real merchants or payments to production.

## Environment

- Run `SELLIO_ENV=staging pnpm env:check`.
- Confirm Supabase URL/anon/service-role keys point to staging, not production.
- Confirm `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_CARDS_URL` are public staging URLs.
- Confirm Sentry DSNs are configured with `environment=staging`.

## Auth And RLS

- Create a merchant account and complete onboarding.
- Confirm the owner can see only their organization, cards, customers, and metrics.
- Confirm a second test user cannot read or mutate the first user's organization data.
- Run `pnpm --filter @sellio/db verify-rls` against staging.

## Payments

- Use Wompi sandbox credentials.
- Create a Basic checkout and process an approved sandbox transaction.
- Repeat with an Elite checkout.
- Replay the same webhook payload and confirm it is idempotent.
- Send declined/error payloads and confirm the organization plan does not upgrade.

## Email

- Send password reset and team invite emails through Resend.
- Confirm sender domain, links, and locale copy.
- Confirm failures are visible in Sentry/logs without leaking API keys.

## Wallets

- Google Wallet: verify missing env returns a clear 503, then configure sandbox credentials and generate a pass URL.
- Apple Wallet: verify missing certificate env returns a clear error, then generate a pass with staging certificates when available.
- Complete a public check-in and confirm wallet update failures do not block the customer flow.

## Smoke

- Run `pnpm verify`.
- Run `PLAYWRIGHT_BASE_URL=<staging-app-url> PLAYWRIGHT_CARDS_URL=<staging-cards-url> pnpm test:e2e`.
