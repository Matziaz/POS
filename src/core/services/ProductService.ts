import { Product } from "../entities";
import { NotFoundError, ValidationError } from "../errors";
import type { ProductRepository } from "../repositories";
import { newId } from "./id";

export class ProductService {
    constructor(private readonly products: ProductRepository) {}

    async createProduct(input: {sku: string; name: string; priceCents: number}): Promise<Product> {
        const existing = await this.products.findBySku(input.sku);
        if (existing) {
            throw new ValidationError(`Product with SKU ${input.sku} already exists`);
        }

        const product = Product.create({ 
            id: newId(),
            sku: input.sku,
            name: input.name,
            priceCents: input.priceCents
        });
        await this.products.save(product);
        return product;
    }

    async getBySku(sku: string): Promise<Product> {
        const product = await this.products.findBySku(sku);
        if (!product) {
            throw new NotFoundError(`Product with SKU ${sku} not found`);
        }
        return product;
    }

    async listProducts(): Promise<Product[]> {
        return this.products.list();
    }
}