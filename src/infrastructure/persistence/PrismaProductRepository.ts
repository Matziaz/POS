import type { ProductListFilters, ProductListSortOptions, ProductRepository, SortDirection } from "../../core/repositories/ProductRepository";
import { Product } from "../../core/entities";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../database/prismaClient";

function toISOOrNow(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizePage(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function normalizeDirection(value?: SortDirection): SortDirection {
  return value === "asc" ? "asc" : "desc";
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
      where: { deleted_at: null },
      orderBy: { created_at: "desc" as any },
    });
    return rows.map(toDomain);
  }

  async listPaginated(
    page: number,
    pageSize: number,
    options?: ProductListSortOptions,
    filters?: ProductListFilters
  ): Promise<{ products: Product[]; total: number }> {
    const safePage = normalizePage(page, 1);
    const safePageSize = normalizePage(pageSize, 10);
    const sortBy = options?.sortBy ?? "createdAt";
    const sortDirection = normalizeDirection(options?.sortDirection);

    const orderBy = (() => {
      switch (sortBy) {
        case "name":
          return { name: sortDirection };
        case "sku":
          return { sku: sortDirection };
        case "price":
          return { price: sortDirection };
        case "stock":
          return { stock: sortDirection };
        case "typeId":
          return { type_id: sortDirection };
        case "createdAt":
        default:
          return { created_at: sortDirection as any };
      }
    })();

   const where: any = { deleted_at: null }

    if (filters?.search?.trim()) {
      const term = `%${filters.search.trim()}%`
      const matchingIds = await this.db.$queryRaw<{ id: string }[]>`
        SELECT id FROM product 
        WHERE deleted_at IS NULL 
        AND (LOWER(name) LIKE LOWER(${term}) OR LOWER(sku) LIKE LOWER(${term}))
      `
    where.id = { in: matchingIds.map((r) => r.id) }
  }

    if (filters?.typeId?.trim()) {
      where.type_id = filters.typeId.trim()
    }

    if (filters?.providerId?.trim()) {
      where.provider_id = filters.providerId.trim()
    }

    if (filters?.stockStatus && filters.stockStatus !== "all") {
      if (filters.stockStatus === "out_of_stock") where.stock = 0
      if (filters.stockStatus === "low_stock") where.stock = { gt: 0, lte: 5 }
      if (filters.stockStatus === "in_stock") where.stock = { gt: 5 }
    }

const [total, rows] = await Promise.all([
  this.db.product.count({ where }),
  this.db.product.findMany({
    where,
        orderBy,
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
    ]);

    return {
      products: rows.map(toDomain),
      total,
    };
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