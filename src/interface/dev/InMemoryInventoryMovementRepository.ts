/**
 * InMemoryInventoryMovementRepository
 * 
 * Implementación temporal en memoria para desarrollo de UI.
 * Necesaria porque SaleService depende de InventoryMovementRepository,
 * y la interfaz aún no tiene archivo (falta en core/repositories/).
 * 
 * TODO: Coordinar con Fer para que cree el archivo InventoryMovementRepository.ts
 * en core/repositories/ y con Alfredo para la implementación real.
 */

import { InventoryMovement } from "@core/entities"

export interface InventoryMovementRepository {
  save(movement: InventoryMovement): Promise<void>
  listByProduct(productId: string): Promise<InventoryMovement[]>
}

export class InMemoryInventoryMovementRepository implements InventoryMovementRepository {
  private movements: InventoryMovement[] = []

  async save(movement: InventoryMovement): Promise<void> {
    this.movements.push(movement)
  }

  async listByProduct(productId: string): Promise<InventoryMovement[]> {
    return this.movements.filter((m) => m.productId === productId)
  }
}
