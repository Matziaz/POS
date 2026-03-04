import type { ProductRepository } from "../../core/repositories/ProductRepository";
import { Product } from "../../core/entities";
import { prisma } from "../database/prismaClient";

function toDomain(row: any): Product {
  // row.created_at es String en schema (ej. "2026-02-27 12:34:56")
  // lo convertimos a ISO string para la entidad
  return Product.create({
    id: row.id,
    sku: row.sku,
    name: row.name,
    price: row.price,
    stock: row.stock,
    providerId: row.provider_id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  });
}

export class PrismaProductRepository implements ProductRepository {
  async save(product: Product): Promise<void> {
    const p = product.toJSON();

    await prisma.product.upsert({
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
        created_at: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      },
    });
  }

  async update(product: Product): Promise<void> {
    await this.save(product);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  async findById(id: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { sku } });
    return row ? toDomain(row) : null;
  }

  async list(): Promise<Product[]> {
    const rows = await prisma.product.findMany({ orderBy: { created_at: "desc" as any} });
    return rows.map(toDomain);
  }
}