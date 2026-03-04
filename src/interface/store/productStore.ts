/**
 * Product Store — Zustand
 * 
 * Estado global para la gestión de productos (inventario).
 * 
 * addProduct usa ProductService.createProduct() (ya corregido por Fer).
 * updateProduct y deleteProduct siguen usando el repositorio directo
 * porque Fer aún no implementa esos métodos en ProductService.
 */

import { create } from "zustand"
import type { ProductProps } from "@core/entities"
import { Product } from "@core/entities"
import { getProductService, getProductRepository } from "@interface/dev/serviceFactory"

export interface CreateProductInput {
  sku: string
  name: string
  price: number
  stock: number
  providerId?: string
}

export interface UpdateProductInput {
  name?: string
  sku?: string
  price?: number
  stock?: number
  providerId?: string
}

interface ProductState {
  products: ProductProps[]
  isLoading: boolean
  error: string | null
  selectedProduct: ProductProps | null

  fetchProducts: () => Promise<void>
  addProduct: (input: CreateProductInput) => Promise<void>
  updateProduct: (id: string, input: UpdateProductInput) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  setSelectedProduct: (product: ProductProps | null) => void
  clearError: () => void
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  selectedProduct: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const service = getProductService()
      const productList = await service.listProducts()
      set({ products: productList.map((p) => p.toJSON()), isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al cargar productos",
        isLoading: false,
      })
    }
  },

  addProduct: async (input: CreateProductInput) => {
    set({ isLoading: true, error: null })
    try {
      const service = getProductService()
      await service.createProduct({
        sku: input.sku,
        name: input.name,
        price: input.price,
        stock: input.stock,
        providerId: input.providerId,
      })
      await get().fetchProducts()
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al crear producto",
        isLoading: false,
      })
      throw err
    }
  },

  updateProduct: async (id: string, input: UpdateProductInput) => {
    set({ isLoading: true, error: null })
    try {
      const repo = getProductRepository()
      const existing = await repo.findById(id)

      if (!existing) {
        throw new Error("Producto no encontrado")
      }

      // Verificar SKU duplicado si se cambió
      if (input.sku && input.sku !== existing.sku) {
        const duplicate = await repo.findBySku(input.sku)
        if (duplicate) {
          throw new Error(`Ya existe un producto con SKU "${input.sku}"`)
        }
      }

      // TODO: Usar productService.updateProduct() cuando Fer lo implemente
      const updated = Product.create({
        id: existing.id,
        sku: input.sku ?? existing.sku,
        name: input.name ?? existing.name,
        price: input.price ?? existing.price,
        stock: input.stock ?? existing.stock,
        providerId: input.providerId ?? existing.providerId,
        createdAt: existing.createdAt,
      })

      await repo.save(updated)
      await get().fetchProducts()
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al actualizar producto",
        isLoading: false,
      })
      throw err
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const repo = getProductRepository()
      // TODO: Usar productService.deleteProduct() cuando Fer lo implemente
      await repo.delete(id)
      await get().fetchProducts()
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al eliminar producto",
        isLoading: false,
      })
      throw err
    }
  },

  setSelectedProduct: (product: ProductProps | null) => {
    set({ selectedProduct: product })
  },

  clearError: () => {
    set({ error: null })
  },
}))
