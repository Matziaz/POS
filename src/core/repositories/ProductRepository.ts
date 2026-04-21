export * from "./ProductRepository"
import type { Product } from "../entities";

export type ProductSortField = "createdAt" | "name" | "sku" | "price" | "stock" | "typeId";
export type SortDirection = "asc" | "desc";

export interface ProductListSortOptions {
    sortBy?: ProductSortField;
    sortDirection?: SortDirection;
}

export interface ProductRepository {
    save(product: Product): Promise<void>;
    update(product: Product): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    list(): Promise<Product[]>;
    listPaginated(page: number, pageSize: number, options?: ProductListSortOptions): Promise<{ products: Product[]; total: number }>;
    listDeleted(): Promise<Product[]>;
    restore(id: string, stock: number): Promise<void>;
}