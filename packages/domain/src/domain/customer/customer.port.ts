import type { Customer } from './customer.entity';

export interface CreateCustomerInput {
  orgId: string;
  phone: string;
  name?: string | null;
  email?: string | null;
}

export interface ICustomerRepository {
  create(input: CreateCustomerInput): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByPhone(orgId: string, phone: string): Promise<Customer | null>;
  findByCard(
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
  >;
  upsert(input: CreateCustomerInput): Promise<Customer>;
  countByOrg(orgId: string): Promise<number>;
}
