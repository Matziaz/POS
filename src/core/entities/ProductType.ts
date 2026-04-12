export type ProductTypeId = string;

export interface ProductTypeProps {
  id: ProductTypeId;
  name: string;
}

export class ProductType {
  private constructor(private readonly props: ProductTypeProps) {}

  static create(input: ProductTypeProps): ProductType {
    if (!input.id?.trim()) throw new Error("ProductType.id is required");
    if (!input.name?.trim()) throw new Error("ProductType.name is required");

    return new ProductType({
      id: input.id.trim(),
      name: input.name.trim(),
    });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }

  toJSON(): ProductTypeProps {
    return { ...this.props };
  }
}
