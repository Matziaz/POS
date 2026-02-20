import type { ProductId } from "./Product";

export type SaleId = string;

export interface SaleItem {
  productId: ProductId;
  skuSnapshot: string;
  nameSnapshot: string;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
}

export interface SaleProps {
  id: SaleId;
  items: SaleItem[];
  totalCents: number;
  createdAt: Date;
}

export class Sale {
  private constructor(private readonly props: SaleProps) {}

  static create(input: { id: SaleId; items: Omit<SaleItem, "lineTotalCents">[]; createdAt?: Date }): Sale {
    const createdAt = input.createdAt ?? new Date();

    if (!input.id?.trim()) throw new Error("Sale.id is required");
    if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("Sale.items must not be empty");

    const items: SaleItem[] = input.items.map((it) => {
      if (!it.productId?.trim()) throw new Error("SaleItem.productId is required");
      if (!it.skuSnapshot?.trim()) throw new Error("SaleItem.skuSnapshot is required");
      if (!it.nameSnapshot?.trim()) throw new Error("SaleItem.nameSnapshot is required");
      if (!Number.isInteger(it.unitPriceCents) || it.unitPriceCents <= 0) throw new Error("SaleItem.unitPriceCents invalid");
      if (!Number.isInteger(it.qty) || it.qty <= 0) throw new Error("SaleItem.qty invalid");

      const lineTotalCents = it.unitPriceCents * it.qty;
      return { ...it, lineTotalCents };
    });

    const totalCents = items.reduce((acc, it) => acc + it.lineTotalCents, 0);
    return new Sale({ id: input.id, items, totalCents, createdAt });
  }

  get id() { return this.props.id; }
  get items() { return this.props.items; }
  get totalCents() { return this.props.totalCents; }
  get createdAt() { return this.props.createdAt; }

  toJSON(): SaleProps {
    return { ...this.props };
  }
}