import type { PrismaClient } from "@prisma/client";
import { ProductType } from "../../core/entities";
import type { ProductTypeRepository } from "../../core/repositories";
import { prisma } from "../database/prismaClient";

function toISOOrNow(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toDomain(row: { id: string | null; name: string; deleted_at: string | null }): ProductType {
  return ProductType.create({
    id: row.id ?? "",
    name: row.name,
    deletedAt: typeof row.deleted_at === "string" ? toISOOrNow(row.deleted_at) : null,
  });
}

export class PrismaProductTypeRepository implements ProductTypeRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(productType: ProductType): Promise<void> {
    const p = productType.toJSON();
    const createData: any = {
      name: p.name,
      deleted_at: p.deletedAt ?? null,
    };
    await this.db.product_type.create({
      data: { ...createData, id: p.id },
    });

  }

  async update(productType: ProductType): Promise<void> {
    const p = productType.toJSON();
    await this.db.product_type.update({
      where: { id: p.id },
      data: { name: p.name },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.product_type.update({
      where: { id },
      data: { deleted_at: new Date().toISOString() },
    });
  }

  async findById(id: string): Promise<ProductType | null> {
    const rows = await this.db.$queryRawUnsafe<Array<{ id: string | null; name: string; deleted_at: string | null }>>(
      "SELECT id, name, deleted_at FROM product_type WHERE id = ? LIMIT 1",
      id
    );

    if (!rows[0] || !rows[0].id) return null;
    return toDomain(rows[0]);
  }

  async findByName(name: string): Promise<ProductType | null> {
    const rows = await this.db.$queryRawUnsafe<Array<{ id: string | null; name: string; deleted_at: string | null }>>(
      "SELECT id, name, deleted_at FROM product_type WHERE LOWER(name) = LOWER(?) LIMIT 1",
      name
    );

    if (!rows[0] || !rows[0].id) return null;
    return toDomain(rows[0]);
  }

  async list(): Promise<ProductType[]> {
    const rows = await this.db.product_type.findMany({  
      orderBy: { name: "asc" as any } });

    return rows.map(toDomain);
  }

  async countProductsUsingType(typeId: string): Promise<number> {
    return this.db.product.count({ where: { type_id: typeId } });
  }

  async listDeleted(): Promise<ProductType[]> {
    const rows = await this.db.product_type.findMany({ 
      where: { deleted_at: { not: null } }, 
      orderBy: { name: "asc" as any } });

    return rows.map(toDomain);
  }

  async restore(id: string): Promise<void> {
    await this.db.product_type.update({
      where: { id },
      data: { deleted_at: null },
    });
  }
}
