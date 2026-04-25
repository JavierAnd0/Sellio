import type {
  CreateOrganizationInput,
  IOrganizationRepository,
  Organization,
  UpdateOrganizationInput,
} from '@sellio/domain';

import { createClient } from '../server';
import type { Tables } from '../types';

type OrgRow = Tables<'organizations'>;

export function orgRowToEntity(row: OrgRow): Organization {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    primaryColor: row.primary_color,
    country: row.country,
    timezone: row.timezone,
    plan: row.plan,
    trialEndsAt: row.trial_ends_at ? new Date(row.trial_ends_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseOrganizationRepository implements IOrganizationRepository {
  async create(input: CreateOrganizationInput): Promise<Organization> {
    const db = await createClient();
    const orgId = crypto.randomUUID();

    const { error: orgError } = await db
      .from('organizations')
      .insert({
        id: orgId,
        name: input.name,
        slug: input.slug,
        ...(input.trialEndsAt ? { trial_ends_at: input.trialEndsAt.toISOString() } : {}),
      });

    if (orgError) {
      if (orgError.code === '23505') {
        throw Object.assign(new Error('Slug already taken'), { code: 'slug_taken' });
      }
      throw Object.assign(new Error(orgError.message), {
        code: orgError.code === '42501' ? 'org_insert_blocked' : 'org_insert_failed',
      });
    }

    const { error: memberError } = await db
      .from('organization_members')
      .insert({ org_id: orgId, user_id: input.ownerId, role: 'owner' });

    if (memberError) {
      throw Object.assign(new Error(memberError.message), {
        code: memberError.code === '42501' ? 'org_members_bootstrap_blocked' : 'org_member_insert_failed',
      });
    }

    const { data: org, error: fetchError } = await db
      .from('organizations')
      .select()
      .eq('id', orgId)
      .single();

    if (fetchError) {
      throw Object.assign(new Error(fetchError.message), { code: 'org_fetch_failed' });
    }

    return orgRowToEntity(org);
  }

  async findByOwner(userId: string): Promise<Organization | null> {
    const db = await createClient();

    const { data, error } = await db
      .from('organizations')
      .select('*, organization_members!inner(role)')
      .eq('organization_members.user_id', userId)
      .eq('organization_members.role', 'owner')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return orgRowToEntity(data as OrgRow);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const db = await createClient();

    const { data, error } = await db
      .from('organizations')
      .select()
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return orgRowToEntity(data);
  }

  async update(id: string, updates: UpdateOrganizationInput): Promise<Organization> {
    const db = await createClient();

    const dbUpdates: Partial<OrgRow> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.primaryColor !== undefined) dbUpdates.primary_color = updates.primaryColor;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;

    const { data, error } = await db
      .from('organizations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return orgRowToEntity(data);
  }
}
