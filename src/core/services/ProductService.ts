import { ValidationError, NotFoundError } from "../errors";
import type { ProductRepository } from "../repositories";
import { Product } from "../entities";
import { newId } from "./id";
import { DEFAULT_PROVIDER_ID } from "../../shared/constants/constants";

export class ProductService {
  constructor(private readonly products: ProductRepository) {}

  async createProduct(input: {
    sku: string;
    name: string;
    price: number;
    stock?: number;
    providerId?: string;
  }): Promise<Product> {
    const sku = input.sku?.trim();
    const name = input.name?.trim();
    const providerId = input.providerId?.trim() || DEFAULT_PROVIDER_ID;
    const stock = input.stock ?? 0;

    if (!sku) throw new ValidationError("sku is required");
    if (!name) throw new ValidationError("name is required");

    if (typeof input.price !== "number" || !Number.isFinite(input.price) || input.price <= 0) {
      throw new ValidationError("price must be a positive number");
    }

    if (!Number.isInteger(stock) || stock < 0) {
      throw new ValidationError("stock must be a non-negative integer");
    }

    // SKU único
    const existing = await this.products.findBySku(sku);
    if (existing) throw new ValidationError(`SKU already exists: ${sku}`);

    const product = Product.create({
      id: newId(),
      sku,
      name,
      price: input.price,
      stock,
      providerId,
    });

    await this.products.save(product);
    return product;
  }

  async setStockBySku(input: { sku: string; stock: number }): Promise<Product> {
    if (!input.sku?.trim()) throw new ValidationError("sku is required");
    if (!Number.isInteger(input.stock) || input.stock < 0) {
      throw new ValidationError("stock must be a non-negative integer");
    }

    const p = await this.products.findBySku(input.sku);
    if (!p) throw new NotFoundError(`Product not found for sku: ${input.sku}`);

    const updated = p.withStock(input.stock);
    await this.products.update(updated);
    return updated;
  }

  async adjustStockBySku(input: { sku: string; delta: number }): Promise<Product> {
    if (!input.sku?.trim()) throw new ValidationError("sku is required");
    if (!Number.isInteger(input.delta) || input.delta === 0) {
      throw new ValidationError("delta must be a non-zero integer");
    }

    const p = await this.products.findBySku(input.sku);
    if (!p) throw new NotFoundError(`Product not found for sku: ${input.sku}`);

    const next = p.stock + input.delta;
    if (next < 0) throw new ValidationError("insufficient stock");

    const updated = p.withStock(next);
    await this.products.update(updated);
    return updated;
  }

  async listProducts(): Promise<Product[]> {
    return this.products.list();
  }

  async getBySku(sku: string): Promise<Product> {
    const s = sku?.trim();
    if (!s) throw new ValidationError("sku is required");
    const p = await this.products.findBySku(s);
    if (!p) throw new NotFoundError(`Product not found for sku: ${s}`);
    return p;
  }
}