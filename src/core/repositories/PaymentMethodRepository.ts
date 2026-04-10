import type { PaymentMethod } from "../entities";

export interface PaymentMethodRepository {
  save(method: PaymentMethod): Promise<void>;
  findById(id: string): Promise<PaymentMethod | null>;
  list(): Promise<PaymentMethod[]>;
  listActive(): Promise<PaymentMethod[]>;
}
