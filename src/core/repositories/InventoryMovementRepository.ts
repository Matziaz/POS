import type { InventoryMovement } from "../entities";

export interface InventoryMovementRepository {
    save(movement: InventoryMovement): Promise<void>;
    listByProduct(productId: string): Promise<InventoryMovement[]>;
}