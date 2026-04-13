export type ProductTypeId = string;

export interface ProductTypeProps {
  id: ProductTypeId;
  name: string;
  deletedAt: string | null; //DB deleted_at String?
}

export class ProductType {
  private constructor(private readonly props: ProductTypeProps) {}

  static create(
    input: Omit<ProductTypeProps, 'deletedAt'> & {
      deletedAt?: string | null;
    }
  ): ProductType {
    const deletedAt = typeof input.deletedAt === "string" && input.deletedAt.trim() ? input.deletedAt.trim() : null;

    if (!input.id?.trim()) throw new Error("ProductType.id is required");
    if (!input.name?.trim()) throw new Error("ProductType.name is required");

    return new ProductType({ ...input, deletedAt });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get deletedAt() { return this.props.deletedAt; }
  
  toJSON(): ProductTypeProps {
    return { ...this.props };
  }
}
