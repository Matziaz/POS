/**
 * PrismaInventoryMovementRepository
 * 
 * Implementación de InventoryMovementRepository usando Prisma ORM.
 * Corre en el proceso main de Electron (Node.js).
 */

import type { InventoryMovementRepository } from "../../core/repositories/InventoryMovementRepository";
import { InventoryMovement } from "../../core/entities/InventoryMovement";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../database/prismaClient";

function toISOOrNow(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export class PrismaInventoryMovementRepository implements InventoryMovementRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(movement: InventoryMovement): Promise<void> {
    const data = movement.toJSON();

    await this.db.inventory_movement.create({
      data: {
        id: data.id,
        product_id: data.productId,
        type: data.type,
        quantity: data.quantity,
        created_at: toISOOrNow(data.createdAt),
      },
    });
  }

  async listByProduct(productId: string): Promise<InventoryMovement[]> {
    const rows = await this.db.inventory_movement.findMany({
      where: { product_id: productId },
      orderBy: { created_at: "desc" as any },
    });

    return rows.map((row) =>
      InventoryMovement.create({
        id: row.id,
        productId: row.product_id,
        type: row.type as "IN" | "OUT",
        quantity: row.quantity,
        createdAt: toISOOrNow(row.created_at),
      })
    );
  }
}
