import { ValidationError, NotFoundError } from "../errors";
import type { InventoryMovementRepository, ProductRepository } from "../repositories";
import { Product, InventoryMovement } from "../entities";
import { newId } from "./id";
import { DEFAULT_PRODUCT_TYPE_ID, DEFAULT_PROVIDER_ID } from "../../shared/constants/constants";

export class ProductService {
  constructor(
    private readonly products: ProductRepository,
    private readonly movements: InventoryMovementRepository
  ) {}

  private async recordStockMovement(productId: string, delta: number): Promise<void> {
    if (delta === 0) return;

    const movement = InventoryMovement.create({
      id: newId(),
      productId,
      type: delta > 0 ? "IN" : "OUT",
      quantity: Math.abs(delta),
    });

    await this.movements.save(movement);
  }

  async createProduct(input: {
    sku: string;
    name: string;
    typeId?: string;
    price: number;
    stock?: number;
    providerId?: string;
    image?: string | null;
  }): Promise<Product> {
    const sku = input.sku?.trim();
    const name = input.name?.trim();
    const typeId = input.typeId?.trim() || DEFAULT_PRODUCT_TYPE_ID;
    const providerId = input.providerId?.trim() || DEFAULT_PROVIDER_ID;
    const stock = input.stock ?? 0;

    if (!sku) throw new ValidationError("sku is required");
    if (!name) throw new ValidationError("name is required");
    if (!typeId) throw new ValidationError("typeId is required");

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
      typeId,
      price: input.price,
      stock,
      providerId,
      image: input.image?.trim() || "", 
    });

    await this.products.save(product);
    await this.recordStockMovement(product.id, stock);
    return product;
  }

  async updateProduct(input: {
    id: string;
    sku?: string;
    name?: string;
    typeId?: string;
    price?: number;
    stock?: number;
    providerId?: string;
    image?: string;
  }): Promise<Product> {
    const id = input.id?.trim();
    if (!id) throw new ValidationError("id is required");

    const existing = await this.products.findById(id);
    if (!existing) throw new NotFoundError(`Product not found for id: ${id}`);

    const sku = input.sku !== undefined ? input.sku.trim() : existing.sku;
    const name = input.name !== undefined ? input.name.trim() : existing.name;
    const typeId = input.typeId !== undefined
      ? input.typeId.trim() || DEFAULT_PRODUCT_TYPE_ID
      : existing.typeId;
    const providerId = input.providerId !== undefined
      ? input.providerId.trim() || DEFAULT_PROVIDER_ID
      : existing.providerId;
    const image = input.image !== undefined
      ? input.image.trim()
      : existing.image ?? "";

    if (!sku) throw new ValidationError("sku is required");
    if (!name) throw new ValidationError("name is required");
    if (!typeId) throw new ValidationError("typeId is required");

    if (input.price !== undefined) {
      if (typeof input.price !== "number" || !Number.isFinite(input.price) || input.price <= 0) {
        throw new ValidationError("price must be a positive number");
      }
    }

    if (input.stock !== undefined) {
      if (!Number.isInteger(input.stock) || input.stock < 0) {
        throw new ValidationError("stock must be a non-negative integer");
      }
    }

    if (sku !== existing.sku) {
      const duplicate = await this.products.findBySku(sku);
      if (duplicate && duplicate.id !== existing.id) {
        throw new ValidationError(`SKU already exists: ${sku}`);
      }
    }

    const updated = Product.create({
      id: existing.id,
      sku,
      name,
      typeId,
      price: input.price ?? existing.price,
      stock: input.stock ?? existing.stock,
      providerId,
      image,
      createdAt: existing.createdAt,
    });

    await this.products.update(updated);
    await this.recordStockMovement(updated.id, updated.stock - existing.stock);
    return updated;
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
    await this.recordStockMovement(updated.id, updated.stock - p.stock);
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
    await this.recordStockMovement(updated.id, input.delta);
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