export type ProductId = string;

export interface ProductProps {
  id: ProductId;
  sku: string;
  name: string;
  priceCents: number; // evitar floats
  createdAt: Date;
}

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(input: Omit<ProductProps, "createdAt"> & { createdAt?: Date }): Product {
    const createdAt = input.createdAt ?? new Date();

    if (!input.id?.trim()) throw new Error("Product.id is required");
    if (!input.sku?.trim()) throw new Error("Product.sku is required");
    if (!input.name?.trim()) throw new Error("Product.name is required");
    if (!Number.isInteger(input.priceCents) || input.priceCents <= 0) {
      throw new Error("Product.priceCents must be a positive integer");
    }

    return new Product({ ...input, createdAt });
  }

  get id() { return this.props.id; }
  get sku() { return this.props.sku; }
  get name() { return this.props.name; }
  get priceCents() { return this.props.priceCents; }
  get createdAt() { return this.props.createdAt; }

  toJSON(): ProductProps {
    return { ...this.props };
  }
}