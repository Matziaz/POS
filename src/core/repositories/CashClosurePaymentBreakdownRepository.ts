import type { CashClosurePaymentBreakdown } from "../entities";

export interface CashClosurePaymentBreakdownRepository {
  save(breakdown: CashClosurePaymentBreakdown): Promise<void>;
  listByCashClosureId(cashClosureId: string): Promise<CashClosurePaymentBreakdown[]>;
}
