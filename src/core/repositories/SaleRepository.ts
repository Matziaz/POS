import type { Sale } from "../entities";

export interface SaleRepository {
    save(sale: Sale): Promise<void>;
    findById(id: string): Promise<Sale | null>;
    list(): Promise<Sale[]>;
    findByDateRange(from: Date, to: Date): Promise<Sale[]>;
    sumTotalByDateRange(from: Date, to: Date): Promise<number>;
    countByDateRange(from: Date, to: Date): Promise<number>;
}