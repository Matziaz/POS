import { SaleItem, type SaleItemProps } from "./SaleItem";
export type SaleId = string;

export interface SaleProps {
  id: SaleId;
  userId: string;    // DB user_id
  total: number;     // DB total Float
  createdAt: string; // DB created_at String
  paymentMethod:'cash' | 'card' | 'transfer' ; // DB payment_method String
  items: SaleItem[];
}

export class Sale {
  private constructor(private readonly props: SaleProps) {}

  static create(input: {
    id: SaleId;
    userId: string;
    items: Omit<SaleItemProps, "saleId">[];
    createdAt?: string;
    paymentMethod: 'cash' | 'card' | 'transfer';
  }): Sale {
    const createdAt = input.createdAt ?? new Date().toISOString();

    if (!input.id?.trim()) throw new Error("Sale.id is required");
    if (!input.userId?.trim()) throw new Error("Sale.userId is required");
    if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("Sale.items must not be empty");
    if (!input.paymentMethod) throw new Error("Sale.paymentMethod is required");

    const items = input.items.map((it) => SaleItem.create({ ...it, saleId: input.id }));
    const total = items.reduce((acc, it) => acc + it.lineTotal, 0);

    return new Sale({ id: input.id, userId: input.userId, total, createdAt, items, paymentMethod: input.paymentMethod });
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get total() { return this.props.total; }
  get createdAt() { return this.props.createdAt; }
  get items() { return this.props.items; }
  get paymentMethod() { return this.props.paymentMethod; }

  toJSON() {
    return { ...this.props, items: this.props.items.map((i) => i.toJSON()) };
  }
}