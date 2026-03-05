/**
 * PrismaInventoryMovementRepository
 * 
 * Implementación de InventoryMovementRepository usando Prisma ORM.
 * Corre en el proceso main de Electron (Node.js).
 */

import type { InventoryMovementRepository } from "../../core/repositories/InventoryMovementRepository";
import { InventoryMovement } from "../../core/entities/InventoryMovement";
import { prisma } from "../database/prismaClient";

export class PrismaInventoryMovementRepository implements InventoryMovementRepository {
  async save(movement: InventoryMovement): Promise<void> {
    const data = movement.toJSON();

    await prisma.inventory_movement.create({
      data: {
        id: data.id,
        product_id: data.productId,
        type: data.type,
        quantity: data.quantity,
        created_at: data.createdAt
          ? new Date(data.createdAt).toISOString()
          : new Date().toISOString(),
      },
    });
  }

  async listByProduct(productId: string): Promise<InventoryMovement[]> {
    const rows = await prisma.inventory_movement.findMany({
      where: { product_id: productId },
      orderBy: { created_at: "desc" as any },
    });

    return rows.map((row) =>
      InventoryMovement.create({
        id: row.id,
        productId: row.product_id,
        type: row.type as "IN" | "OUT",
        quantity: row.quantity,
        createdAt: row.created_at
          ? new Date(row.created_at).toISOString()
          : new Date().toISOString(),
      })
    );
  }
}
