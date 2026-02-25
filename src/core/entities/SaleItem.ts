import type { ProductId } from "./Product";
export type SaleItemId = string;
export type SaleId = string;

export interface SaleItemProps {
  id: SaleItemId;
  saleId: SaleId;
  productId: ProductId;
  quantity: number; //DB Int
  price: number; //DB Float
}

export class SaleItem {
  private constructor(private readonly props: SaleItemProps) {}

  static create(input: SaleItemProps): SaleItem {
    if (!input.id?.trim()) throw new Error("SaleItem.id is required");
    if (!input.saleId?.trim()) throw new Error("SaleItem.saleId is required");
    if (!input.productId?.trim()) throw new Error("SaleItem.productId is required");

    if(!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new Error("SaleItem.quantity must be a positive integer");
    }

    if(typeof input.price !== "number" || !Number.isFinite(input.price) || input.price <= 0) {
      throw new Error("SaleItem.price must be a positive number");
    }

    return new SaleItem(input);
  }

  get id() { return this.props.id; }
  get saleId() { return this.props.saleId; }
  get productId() { return this.props.productId; }
  get quantity() { return this.props.quantity; }
  get price() { return this.props.price; }
  get lineTotal() { return this.props.quantity * this.props.price; }

  toJSON(): SaleItemProps {
    return { ...this.props };
  }
}

