import type { Membership } from './membership.entity';

export interface IMembershipRepository {
  create(cardId: string, customerId: string): Promise<Membership>;
  findBySlug(slug: string): Promise<Membership | null>;
  findByCardAndCustomer(cardId: string, customerId: string): Promise<Membership | null>;
  countScansByCard(cardId: string): Promise<number>;
}
