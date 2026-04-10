export type ProductId = string;

export interface ProductProps {
  id: ProductId;
  sku: string;
  name: string;
  typeId: string; //DB type_id
  price: number; //DB Float
  stock: number; //DB Int default 
  providerId: string; //DB provider_id
  image: string; //DB image_url
  createdAt: string; //DB created_at String
  deletedAt: string | null; //DB deleted_at String?
}

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(
    input: Omit<ProductProps, "createdAt" | "stock" | "typeId" | "image" | "deletedAt"> & {
      createdAt?: string;
      stock?: number;
      typeId?: string;
      image?: string;
      deletedAt?: string | null;
    }
  ): Product {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const stock = input.stock ?? 0;
    const typeId = input.typeId?.trim() || "1";
    const image = input.image?.trim() ? input.image.trim() : "";
    const deletedAt = typeof input.deletedAt === "string" && input.deletedAt.trim()
      ? input.deletedAt.trim()
      : null;

    if (!input.id?.trim()) throw new Error("Product.id is required");
    if (!input.sku?.trim()) throw new Error("Product.sku is required");
    if (!input.name?.trim()) throw new Error("Product.name is required");
    if (!typeId) throw new Error("Product.typeId is required");
    if (!input.providerId?.trim()) throw new Error("Product.providerId is required");

    if(typeof input.price !== "number" || !Number.isFinite(input.price) || input.price <= 0) {
      throw new Error("Product.price must be a positive number");
    }

    if(!Number.isInteger(stock) || stock < 0) {
      throw new Error("Product.stock must be a non-negative integer");
    }

    return new Product({ ...input, typeId, image, stock, createdAt, deletedAt });
  }

  get id() { return this.props.id; }
  get sku() { return this.props.sku; }
  get name() { return this.props.name; }
  get typeId() { return this.props.typeId; }
  get price() { return this.props.price; }
  get stock() { return this.props.stock; }
  get providerId() { return this.props.providerId; }
  get image() { return this.props.image; }
  get createdAt() { return this.props.createdAt; }
  get deletedAt() { return this.props.deletedAt ?? null; }

  withStock(newStock: number): Product {
    if(!Number.isInteger(newStock) || newStock < 0) {
      throw new Error("Product.stock must be a non-negative integer");
    }
    return new Product({ ...this.props, stock: newStock });
  }

  toJSON(): ProductProps {
    return { ...this.props };
  }
}