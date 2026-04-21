/**
 * InMemoryProductRepository
 * 
 * Implementación temporal en memoria de ProductRepository para desarrollo de UI.
 * Reemplazar con la implementación real de infrastructure/ cuando esté lista.
 * 
 * NOTA: Incluye método delete() que aún no existe en la interfaz de ProductRepository.
 * Coordinar con Fer para agregarlo al contrato oficial.
 */

import { Product } from "@core/entities"
import type { ProductListSortOptions, ProductRepository, SortDirection } from "@core/repositories"
import { DEFAULT_PRODUCT_TYPE_ID, DEFAULT_PROVIDER_ID } from "@core/constants"
import { newId } from "@core/services/id"

function compareValues(left: string | number, right: string | number, direction: SortDirection): number {
  if (left === right) return 0
  const result = left < right ? -1 : 1
  return direction === "desc" ? -result : result
}

export class InMemoryProductRepository implements ProductRepository {
  private products = new Map<string, Product>()

  constructor() {
    this.seed()
  }

  private seed(): void {
    const sampleProducts = [
      Product.create({
        id: newId(),
        sku: "COCA-600",
        name: "Coca-Cola 600ml",
        typeId: DEFAULT_PRODUCT_TYPE_ID,
        price: 18.50,
        stock: 24,
        providerId: DEFAULT_PROVIDER_ID,
      }),
      Product.create({
        id: newId(),
        sku: "SAB-MARUC",
        name: "Sopa Maruchan",
        typeId: DEFAULT_PRODUCT_TYPE_ID,
        price: 14.00,
        stock: 36,
        providerId: DEFAULT_PROVIDER_ID,
      }),
      Product.create({
        id: newId(),
        sku: "GAL-ALPURA",
        name: "Leche Alpura 1L",
        typeId: DEFAULT_PRODUCT_TYPE_ID,
        price: 28.90,
        stock: 12,
        providerId: DEFAULT_PROVIDER_ID,
      }),
      Product.create({
        id: newId(),
        sku: "PAN-BIMBO",
        name: "Pan Bimbo Grande",
        typeId: DEFAULT_PRODUCT_TYPE_ID,
        price: 52.00,
        stock: 8,
        providerId: DEFAULT_PROVIDER_ID,
      }),
      Product.create({
        id: newId(),
        sku: "JAB-ZOTE",
        name: "Jabón Zote",
        typeId: DEFAULT_PRODUCT_TYPE_ID,
        price: 22.50,
        stock: 15,
        providerId: DEFAULT_PROVIDER_ID,
      }),
    ]

    for (const product of sampleProducts) {
      this.products.set(product.id, product)
    }
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product)
  }

  async update(product: Product): Promise<void> {
    return this.save(product)
  }

  async delete(id: string): Promise<void> {
    const existing = this.products.get(id)
    if (!existing) return

    this.products.set(
      id,
      Product.create({
        ...existing.toJSON(),
        deletedAt: new Date().toISOString(),
      })
    )
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id)
    if (!product || product.deletedAt) return null
    return product
  }

  async findBySku(sku: string): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.sku === sku && !product.deletedAt) return product
    }
    return null
  }

  async list(): Promise<Product[]> {
    return Array.from(this.products.values()).filter((product) => !product.deletedAt)
  }

  async listPaginated(
    page: number,
    pageSize: number,
    options?: ProductListSortOptions
  ): Promise<{ products: Product[]; total: number }> {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10
    const sortBy = options?.sortBy ?? "createdAt"
    const sortDirection: SortDirection = options?.sortDirection ?? "desc"

    const ordered = Array.from(this.products.values())
      .filter((product) => !product.deletedAt)
      .sort((left, right) => {
        switch (sortBy) {
          case "name":
            return compareValues(left.name.toLowerCase(), right.name.toLowerCase(), sortDirection)
          case "sku":
            return compareValues(left.sku.toLowerCase(), right.sku.toLowerCase(), sortDirection)
          case "price":
            return compareValues(left.price, right.price, sortDirection)
          case "stock":
            return compareValues(left.stock, right.stock, sortDirection)
          case "typeId":
            return compareValues(left.typeId.toLowerCase(), right.typeId.toLowerCase(), sortDirection)
          case "createdAt":
          default:
            return compareValues(new Date(left.createdAt).getTime(), new Date(right.createdAt).getTime(), sortDirection)
        }
      })

    const start = (safePage - 1) * safePageSize
    return {
      products: ordered.slice(start, start + safePageSize),
      total: ordered.length,
    }
  }

  async listDeleted(): Promise<Product[]> {
    return Array.from(this.products.values()).filter((product) => !!product.deletedAt)
  }

  async restore(id: string, stock: number): Promise<void> {
    const existing = this.products.get(id)
    if (!existing) throw new Error("Product not found")
    if (!existing.deletedAt) throw new Error("Product is not deleted")

    for (const candidate of this.products.values()) {
      if (candidate.id !== id && candidate.sku === existing.sku && !candidate.deletedAt) {
        throw new Error(`Cannot restore product: active SKU already exists (${existing.sku})`)
      }
    }

    this.products.set(
      id,
      Product.create({
        ...existing.toJSON(),
        stock,
        deletedAt: null,
      })
    )
  }

  /**
   * Elimina un producto por ID.
   * TODO: Este método no existe en la interfaz ProductRepository de core/.
   * Coordinar con Fer para agregarlo al contrato oficial.
   */

  /* MÉTODO YA IMPLEMENTADO EN CORE -Fer */
}
