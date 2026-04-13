import type { ProductRepository } from "../../core/repositories/ProductRepository";
import { Product } from "../../core/entities";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../database/prismaClient";

function toISOOrNow(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toDomain(row: any): Product {
  return Product.create({
    id: row.id,
    sku: row.sku,
    name: row.name,
    typeId: typeof row.type_id === "string" && row.type_id.trim() ? row.type_id : "1",
    price: row.price,
    stock: row.stock,
    providerId: row.provider_id,
    image: row.image,
    createdAt: toISOOrNow(row.created_at),
    deletedAt: typeof row.deleted_at === "string" ? toISOOrNow(row.deleted_at) : null,
  });
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(product: Product): Promise<void> {
    const p = product.toJSON();
    const typeId = typeof p.typeId === "string" && p.typeId.trim() ? p.typeId.trim() : "1";
    const updateData: any = {
      name: p.name,
      sku: p.sku,
      type_id: typeId,
      price: p.price,
      stock: p.stock,
      provider_id: p.providerId,
      image: p.image,
      deleted_at: p.deletedAt ?? null,
    };
    const createData: any = {
      id: p.id,
      name: p.name,
      sku: p.sku,
      type_id: typeId,
      price: p.price,
      stock: p.stock,
      provider_id: p.providerId,
      image: p.image,
      created_at: toISOOrNow(p.createdAt),
      deleted_at: p.deletedAt ?? null,
    };

    await this.db.product.upsert({
      where: { id: p.id },
      update: updateData,
      create: createData,
    });
  }

  async update(product: Product): Promise<void> {
    await this.save(product);
  }

  async delete(id: string): Promise<void> {
    await this.db.product.update({
      where: { id },
      data: { deleted_at: new Date().toISOString() },
    });
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.db.product.findFirst({ where: { id, deleted_at: null } });
    return row ? toDomain(row) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const row = await this.db.product.findFirst({ where: { sku, deleted_at: null } });
    return row ? toDomain(row) : null;
  }

  async list(): Promise<Product[]> {
    const rows = await this.db.product.findMany({
      orderBy: { created_at: "desc" as any },
    });
    return rows.map(toDomain);
  }

  async listDeleted(): Promise<Product[]> {
    const rows = await this.db.product.findMany({
      where: { deleted_at: { not: null } },
      orderBy: { created_at: "desc" as any },
    });
    return rows.map(toDomain);
  }

  async restore(id: string, stock: number): Promise<void> {
    const product = await this.db.product.findUnique({ where: { id } });
    if (!product) throw new Error("Product not found");
    if (!product.deleted_at) throw new Error("Product is not deleted");

    const activeDuplicate = await this.db.product.findFirst({
      where: {
        sku: product.sku,
        deleted_at: null,
        id: { not: id },
      },
    });

    if (activeDuplicate) {
      throw new Error(`Cannot restore product: active SKU already exists (${product.sku})`);
    }

    await this.db.product.update({
      where: { id },
      data: { deleted_at: null, stock },
    });
  }

}