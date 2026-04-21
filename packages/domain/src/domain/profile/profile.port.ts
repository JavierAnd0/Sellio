import type { Profile } from './profile.entity';

export interface UpdateProfileInput {
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  update(id: string, updates: UpdateProfileInput): Promise<Profile>;
}
