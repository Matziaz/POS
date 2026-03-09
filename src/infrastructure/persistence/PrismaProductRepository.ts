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
    price: row.price,
    stock: row.stock,
    providerId: row.provider_id,
    createdAt: toISOOrNow(row.created_at),
  });
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(product: Product): Promise<void> {
    const p = product.toJSON();

    await this.db.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        provider_id: p.providerId,
        // created_at lo dejamos tal cual para no “pisar” timestamps en updates
      },
      create: {
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        provider_id: p.providerId,
        created_at: toISOOrNow(p.createdAt),
      },
    });
  }

  async update(product: Product): Promise<void> {
    await this.save(product);
  }

  async delete(id: string): Promise<void> {
    await this.db.product.delete({ where: { id } });
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.db.product.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const row = await this.db.product.findUnique({ where: { sku } });
    return row ? toDomain(row) : null;
  }

  async list(): Promise<Product[]> {
    const rows = await this.db.product.findMany({ orderBy: { created_at: "desc" as any} });
    return rows.map(toDomain);
  }
}