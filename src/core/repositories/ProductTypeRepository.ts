import type { ProductType } from "../entities";

export interface ProductTypeRepository {
  save(productType: ProductType): Promise<void>;
  update(productType: ProductType): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ProductType | null>;
  findByName(name: string): Promise<ProductType | null>;
  list(): Promise<ProductType[]>;
  countProductsUsingType(typeId: string): Promise<number>;
}
