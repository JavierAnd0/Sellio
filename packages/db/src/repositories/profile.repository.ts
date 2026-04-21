import type { IProfileRepository, Profile, UpdateProfileInput } from '@sellio/domain';

import { createClient } from '../server';
import type { Tables } from '../types';

type ProfileRow = Tables<'profiles'>;

function toEntity(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseProfileRepository implements IProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    const db = await createClient();

    const { data, error } = await db
      .from('profiles')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return toEntity(data);
  }

  async update(id: string, updates: UpdateProfileInput): Promise<Profile> {
    const db = await createClient();

    const dbUpdates: Partial<ProfileRow> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    const { data, error } = await db
      .from('profiles')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return toEntity(data);
  }
}
