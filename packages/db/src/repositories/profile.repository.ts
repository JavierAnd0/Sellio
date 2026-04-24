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

    const dbUpdates = {
      id,
      ...(updates.fullName !== undefined && { full_name: updates.fullName }),
      ...(updates.phone !== undefined && { phone: updates.phone }),
      ...(updates.avatarUrl !== undefined && { avatar_url: updates.avatarUrl }),
    };

    const { data, error } = await db
      .from('profiles')
      .upsert(dbUpdates)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return toEntity(data);
  }
}
