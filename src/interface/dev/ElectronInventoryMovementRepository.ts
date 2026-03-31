/**
 * ElectronInventoryMovementRepository
 * 
 * Implementa InventoryMovementRepository llamando al proceso main via IPC.
 * Los datos viajan como JSON plano y se reconstruyen como entidades.
 * 
 * Corre en el renderer (React). No importa Prisma.
 */

import { InventoryMovement } from "@core/entities"
import type { InventoryMovementRepository } from "@core/repositories"

function getAPI(): NonNullable<typeof window.electronAPI> {
  const api = window.electronAPI
  if (!api) throw new Error("electronAPI not available — ¿está corriendo en Electron?")
  return api
}

export class ElectronInventoryMovementRepository implements InventoryMovementRepository {
  async save(movement: InventoryMovement): Promise<void> {
    await getAPI().inventoryMovementSave(movement.toJSON())
  }

  async listByProduct(productId: string): Promise<InventoryMovement[]> {
    const rows = await getAPI().inventoryMovementListByProduct(productId)
    return rows.map((json: any) =>
      InventoryMovement.create({
        id: json.id,
        productId: json.productId,
        type: json.type as "IN" | "OUT",
        quantity: json.quantity,
        createdAt: json.createdAt,
      })
    )
  }
}
