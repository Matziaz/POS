/**
 * ElectronProductRepository
 * 
 * Implementa ProductRepository llamando al proceso main de Electron via IPC.
 * Los datos viajan como JSON plano y se reconstruyen como entidades Product.
 * 
 * Corre en el renderer (React). No importa Prisma.
 */

import { Product } from "@core/entities"
import type { ProductListSortOptions, ProductRepository } from "@core/repositories"

function getAPI(): NonNullable<typeof window.electronAPI> {
  const api = window.electronAPI
  if (!api) throw new Error("electronAPI not available — ¿está corriendo en Electron?")
  return api
}

export class ElectronProductRepository implements ProductRepository {
  async save(product: Product): Promise<void> {
    await getAPI().productSave(product.toJSON())
  }

  async update(product: Product): Promise<void> {
    await this.save(product)
  }

  async delete(id: string): Promise<void> {
    await getAPI().productDelete(id)
  }

  async findById(id: string): Promise<Product | null> {
    const json = await getAPI().productFindById(id)
    if (!json) return null
    return Product.create(json)
  }

  async findBySku(sku: string): Promise<Product | null> {
    const json = await getAPI().productFindBySku(sku)
    if (!json) return null
    return Product.create(json)
  }

  async list(): Promise<Product[]> {
    const rows = await getAPI().productList()
    return rows.map((json: any) => Product.create(json))
  }

  async listPaginated(
    page: number,
    pageSize: number,
    options?: ProductListSortOptions
  ): Promise<{ products: Product[]; total: number }> {
    const result = await getAPI().productListPaginated(page, pageSize, options)
    return {
      products: result.products.map((json: any) => Product.create(json)),
      total: result.total,
    }
  }

  async listDeleted(): Promise<Product[]> {
    const rows = await getAPI().productListDeleted()
    return rows.map((json: any) => Product.create(json))
  }

  async restore(id: string, stock: number): Promise<void> {
    await getAPI().productRestore(id, stock)
  }
}
