import type { Sale } from "../entities";

export interface SaleRepository {
    save(sale: Sale): Promise<void>;
    findById(id: string): Promise<Sale | null>;
    list(): Promise<Sale[]>;
}