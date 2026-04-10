import type { CashRegister } from "../entities";

export interface CashRegisterRepository {
  save(cashRegister: CashRegister): Promise<void>;
  findById(id: string): Promise<CashRegister | null>;
  list(): Promise<CashRegister[]>;
  findOpen(): Promise<CashRegister | null>;
}
