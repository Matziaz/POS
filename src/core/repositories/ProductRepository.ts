export * from "./ProductRepository"
import type { Product } from "../entities";

export interface ProductRepository {
    save(product: Product): Promise<void>;
    update(product: Product): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    list(): Promise<Product[]>;
    listDeleted(): Promise<Product[]>;
    restore(id: string, stock: number): Promise<void>;
}