import type { Product } from "../entities";

export interface ProductRepository {
    save(product: Product): Promise<void>;
    update(product: Product): Promise<void>;
    findById(id: string): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    list(): Promise<Product[]>;
}