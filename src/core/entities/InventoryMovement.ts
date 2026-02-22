import type { ProductId } from "./Product";
export type InventoryMovementId = string;
export type InventoryMovementType = "IN" | "OUT";

export interface InventoryMovementProps {
  id: InventoryMovementId;
  productId: ProductId;
  type: InventoryMovementType; //DB type String
  quantity: number; //DB Int
  createdAt: string;
}

export class InventoryMovement {
  private constructor(private readonly props: InventoryMovementProps) {}

  static create(input: Omit<InventoryMovementProps, "createdAt"> & { createdAt?: string }): InventoryMovement {
    const createdAt = input.createdAt ?? new Date().toISOString();

    if (!input.id?.trim()) throw new Error("InventoryMovement.id is required");
    if (!input.productId?.trim()) throw new Error("InventoryMovement.productId is required");
    if (input.type !== "IN" && input.type !== "OUT") throw new Error("InventoryMovement.type must be 'IN' or 'OUT'");

    if(!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new Error("InventoryMovement.quantity must be a positive integer");
    }

    return new InventoryMovement({ ...input, createdAt });
  }

  get id() { return this.props.id; }
  get productId() { return this.props.productId; }
  get type() { return this.props.type; }
  get quantity() { return this.props.quantity; }
  get createdAt() { return this.props.createdAt; }

  toJSON(): InventoryMovementProps {
    return { ...this.props };
  }
}   