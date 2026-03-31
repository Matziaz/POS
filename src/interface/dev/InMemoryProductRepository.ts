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
import type { ProductRepository } from "@core/repositories"
import { DEFAULT_PRODUCT_TYPE_ID, DEFAULT_PROVIDER_ID } from "@core/constants"
import { newId } from "@core/services/id"

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
    this.products.delete(id)
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null
  }

  async findBySku(sku: string): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.sku === sku) return product
    }
    return null
  }

  async list(): Promise<Product[]> {
    return Array.from(this.products.values())
  }

  /**
   * Elimina un producto por ID.
   * TODO: Este método no existe en la interfaz ProductRepository de core/.
   * Coordinar con Fer para agregarlo al contrato oficial.
   */

  /* MÉTODO YA IMPLEMENTADO EN CORE -Fer */
}
