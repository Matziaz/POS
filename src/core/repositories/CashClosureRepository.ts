import type { CashClosure } from "../entities";

export interface CashClosureRepository {
  save(cashClosure: CashClosure): Promise<void>;
  findById(id: string): Promise<CashClosure | null>;
  listByBusinessDateRange(fromISO: string, toISO: string): Promise<CashClosure[]>;
}
