import { prisma } from "../database/prismaClient.ts";
import type { InventoryMovementRepository } from "../../core/repositories/InventoryMovementRepository.ts";
import { InventoryMovement } from "../../core/entities/InventoryMovement.ts";

export class SQLiteInventoryMovementRepository
  implements InventoryMovementRepository {

  async save(movement: InventoryMovement): Promise<void> {

    await prisma.inventory_movement.create({
      data: {
        id: movement.id,
        product_id: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        created_at: movement.createdAt,
      },
    });

  }

  async listByProduct(productId: string): Promise<InventoryMovement[]> {

    const results = await prisma.inventory_movement.findMany({
      where: { product_id: productId },
      orderBy: { created_at: "desc" },
    });

    return results.map((m) => this.toDomain(m));
  }

  /**
   * Convierte Prisma → Domain Entity
   */
  private toDomain(prismaMovement: any): InventoryMovement {

    return InventoryMovement.create({
      id: prismaMovement.id,
      productId: prismaMovement.product_id,
      type: prismaMovement.type,
      quantity: prismaMovement.quantity,
      createdAt: prismaMovement.created_at,
    });

  }

}