import type { PrismaClient } from "@prisma/client";
import { ProductType } from "../../core/entities";
import type { ProductTypeRepository } from "../../core/repositories";
import { prisma } from "../database/prismaClient";

function toDomain(row: { id: string | null; name: string }): ProductType {
  return ProductType.create({
    id: row.id ?? "",
    name: row.name,
  });
}

export class PrismaProductTypeRepository implements ProductTypeRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(productType: ProductType): Promise<void> {
    const p = productType.toJSON();
    await this.db.$executeRawUnsafe(
      "INSERT INTO product_type (id, name) VALUES (?, ?)",
      p.id,
      p.name
    );
  }

  async update(productType: ProductType): Promise<void> {
    const p = productType.toJSON();
    await this.db.$executeRawUnsafe(
      "UPDATE product_type SET name = ? WHERE id = ?",
      p.name,
      p.id
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.$executeRawUnsafe("DELETE FROM product_type WHERE id = ?", id);
  }

  async findById(id: string): Promise<ProductType | null> {
    const rows = await this.db.$queryRawUnsafe<Array<{ id: string | null; name: string }>>(
      "SELECT id, name FROM product_type WHERE id = ? LIMIT 1",
      id
    );

    if (!rows[0] || !rows[0].id) return null;
    return toDomain(rows[0]);
  }

  async findByName(name: string): Promise<ProductType | null> {
    const rows = await this.db.$queryRawUnsafe<Array<{ id: string | null; name: string }>>(
      "SELECT id, name FROM product_type WHERE LOWER(name) = LOWER(?) LIMIT 1",
      name
    );

    if (!rows[0] || !rows[0].id) return null;
    return toDomain(rows[0]);
  }

  async list(): Promise<ProductType[]> {
    const rows = await this.db.$queryRawUnsafe<Array<{ id: string | null; name: string }>>(
      "SELECT id, name FROM product_type WHERE id IS NOT NULL ORDER BY name ASC"
    );

    return rows.filter((row) => !!row.id).map(toDomain);
  }

  async countProductsUsingType(typeId: string): Promise<number> {
    return this.db.product.count({ where: { type_id: typeId } });
  }
}
