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
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseOrganizationRepository implements IOrganizationRepository {
  async create(input: CreateOrganizationInput): Promise<Organization> {
    const db = await createClient();

    const { data: org, error: orgError } = await db
      .from('organizations')
      .insert({ name: input.name, slug: input.slug })
      .select()
      .single();

    if (orgError) {
      if (orgError.code === '23505') {
        throw Object.assign(new Error('Slug already taken'), { code: 'slug_taken' });
      }
      throw new Error(orgError.message);
    }

    const { error: memberError } = await db
      .from('organization_members')
      .insert({ org_id: org.id, user_id: input.ownerId, role: 'owner' });

    if (memberError) {
      throw new Error(memberError.message);
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
