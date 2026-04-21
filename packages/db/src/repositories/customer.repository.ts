import type {
  CreateCustomerInput,
  Customer,
  ICustomerRepository,
} from '@sellio/domain';

import { createClient } from '../server';
import type { Tables } from '../types';

type CustomerRow = Tables<'customers'>;

export function customerRowToEntity(row: CustomerRow): Customer {
  return {
    id: row.id,
    orgId: row.org_id,
    phone: row.phone,
    name: row.name,
    email: row.email,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseCustomerRepository implements ICustomerRepository {
  async create(input: CreateCustomerInput): Promise<Customer> {
    const db = await createClient();

    const { data, error } = await db
      .from('customers')
      .insert({
        org_id: input.orgId,
        phone: input.phone,
        name: input.name ?? null,
        email: input.email ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return customerRowToEntity(data);
  }

  async findById(id: string): Promise<Customer | null> {
    const db = await createClient();

    const { data, error } = await db
      .from('customers')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return customerRowToEntity(data);
  }

  async findByPhone(orgId: string, phone: string): Promise<Customer | null> {
    const db = await createClient();

    const { data, error } = await db
      .from('customers')
      .select()
      .eq('org_id', orgId)
      .eq('phone', phone)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return customerRowToEntity(data);
  }

  async findByCard(
    cardId: string,
  ): Promise<
    Array<
      Customer & {
        membership: {
          id: string;
          slug: string;
          points: number;
          joinedAt: Date;
          lastActivityAt: Date | null;
        };
      }
    >
  > {
    const db = await createClient();

    const { data, error } = await db
      .from('memberships')
      .select('*, customers(*)')
      .eq('card_id', cardId)
      .order('joined_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const customer = row.customers as CustomerRow;
      return {
        ...customerRowToEntity(customer),
        membership: {
          id: row.id,
          slug: row.slug,
          points: row.points,
          joinedAt: new Date(row.joined_at),
          lastActivityAt: row.last_activity_at ? new Date(row.last_activity_at) : null,
        },
      };
    });
  }

  async countByOrg(orgId: string): Promise<number> {
    const db = await createClient();

    const { count, error } = await db
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async upsert(input: CreateCustomerInput): Promise<Customer> {
    const db = await createClient();

    const { data, error } = await db
      .from('customers')
      .upsert(
        {
          org_id: input.orgId,
          phone: input.phone,
          name: input.name ?? null,
          email: input.email ?? null,
        },
        { onConflict: 'org_id,phone' },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);

    return customerRowToEntity(data);
  }
}
