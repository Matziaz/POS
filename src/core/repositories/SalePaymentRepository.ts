import type { SalePayment } from "../entities";

export interface SalePaymentRepository {
  save(payment: SalePayment): Promise<void>;
  listBySaleId(saleId: string): Promise<SalePayment[]>;
}
