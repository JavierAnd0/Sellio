import type { Organization } from './organization.entity';

export interface CreateOrganizationInput {
  ownerId: string;
  name: string;
  slug: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  primaryColor?: string;
  logoUrl?: string | null;
}

export interface IOrganizationRepository {
  create(input: CreateOrganizationInput): Promise<Organization>;
  findByOwner(userId: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  update(id: string, updates: UpdateOrganizationInput): Promise<Organization>;
}
