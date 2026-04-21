/**
 * Product Store — Zustand
 * 
 * Estado global para la gestión de productos (inventario).
 * 
 * addProduct y updateProduct usan ProductService para aplicar
 * reglas de negocio y trazabilidad de movimientos de inventario.
 * deleteProduct sigue usando el repositorio directo.
 */

import { create } from "zustand"
import type { ProductProps } from "@core/entities"
import type { ProductListSortOptions } from "@core/repositories"
import { getProductService, getProductRepository } from "@interface/dev/serviceFactory"

export interface CreateProductInput {
  sku: string
  name: string
  typeId: string
  price: number
  stock: number
  image?: string
  providerId?: string
}

export interface UpdateProductInput {
  name?: string
  sku?: string
  typeId?: string
  price?: number
  stock?: number
  image?: string
  providerId?: string
}

interface ProductState {
  products: ProductProps[]
  deletedProducts: ProductProps[]
  inventoryProducts: ProductProps[]
  inventoryTotal: number
  inventoryPage: number
  inventoryPageSize: number
  inventorySortBy: ProductListSortOptions["sortBy"]
  inventorySortDirection: ProductListSortOptions["sortDirection"]
  isLoading: boolean
  isInventoryLoading: boolean
  error: string | null
  selectedProduct: ProductProps | null

  fetchProducts: () => Promise<void>
  fetchDeletedProducts: () => Promise<void>
  fetchInventoryProducts: (
    page?: number,
    pageSize?: number,
    sortBy?: ProductListSortOptions["sortBy"],
    sortDirection?: ProductListSortOptions["sortDirection"]
  ) => Promise<void>
  addProduct: (input: CreateProductInput) => Promise<void>
  updateProduct: (id: string, input: UpdateProductInput) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  restoreProduct: (id: string, stock: number) => Promise<void>
  setSelectedProduct: (product: ProductProps | null) => void
  clearError: () => void
}

let inventoryRequestId = 0

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  deletedProducts: [],
  inventoryProducts: [],
  inventoryTotal: 0,
  inventoryPage: 1,
  inventoryPageSize: 12,
  inventorySortBy: "createdAt",
  inventorySortDirection: "desc",
  isLoading: false,
  isInventoryLoading: false,
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

  fetchDeletedProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const repo = getProductRepository()
      const productList = await repo.listDeleted()
      set({ deletedProducts: productList.map((p) => p.toJSON()), isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al cargar productos eliminados",
        isLoading: false,
      })
    }
  },

  fetchInventoryProducts: async (page, pageSize, sortBy, sortDirection) => {
    const requestId = ++inventoryRequestId
    const nextPage = Number.isFinite(page ?? NaN) && (page ?? 0) > 0 ? Math.floor(page as number) : get().inventoryPage
    const nextPageSize =
      Number.isFinite(pageSize ?? NaN) && (pageSize ?? 0) > 0
        ? Math.floor(pageSize as number)
        : get().inventoryPageSize
    const nextSortBy = sortBy ?? get().inventorySortBy ?? "createdAt"
    const nextSortDirection = sortDirection ?? get().inventorySortDirection ?? "desc"

    set({
      isInventoryLoading: true,
      error: null,
      inventoryPage: nextPage,
      inventoryPageSize: nextPageSize,
      inventorySortBy: nextSortBy,
      inventorySortDirection: nextSortDirection,
    })

    try {
      const repo = getProductRepository()
      const result = await repo.listPaginated(nextPage, nextPageSize, {
        sortBy: nextSortBy,
        sortDirection: nextSortDirection,
      })

      if (requestId !== inventoryRequestId) return

      set({
        inventoryProducts: result.products.map((p) => p.toJSON()),
        inventoryTotal: result.total,
        isInventoryLoading: false,
      })
    } catch (err) {
      if (requestId !== inventoryRequestId) return

      set({
        error: err instanceof Error ? err.message : "Error al cargar inventario paginado",
        isInventoryLoading: false,
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
        typeId: input.typeId,
        price: input.price,
        stock: input.stock,
        image: input.image,
        providerId: input.providerId,
      })
      await get().fetchProducts()
      await get().fetchInventoryProducts(
        get().inventoryPage,
        get().inventoryPageSize,
        get().inventorySortBy,
        get().inventorySortDirection
      )
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
      const service = getProductService()
      await service.updateProduct({
        id,
        sku: input.sku,
        name: input.name,
        typeId: input.typeId,
        price: input.price,
        stock: input.stock,
        providerId: input.providerId,
        image: input.image,
      })
      await get().fetchProducts()
      await get().fetchInventoryProducts(
        get().inventoryPage,
        get().inventoryPageSize,
        get().inventorySortBy,
        get().inventorySortDirection
      )
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
      await get().fetchDeletedProducts()
      await get().fetchInventoryProducts(
        get().inventoryPage,
        get().inventoryPageSize,
        get().inventorySortBy,
        get().inventorySortDirection
      )
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al eliminar producto",
        isLoading: false,
      })
      throw err
    }
  },

  restoreProduct: async (id: string, stock: number) => {
    set({ isLoading: true, error: null })
    try {
      const service = getProductService()
      await service.restoreProduct({ id, stock })
      await get().fetchProducts()
      await get().fetchDeletedProducts()
      await get().fetchInventoryProducts(
        get().inventoryPage,
        get().inventoryPageSize,
        get().inventorySortBy,
        get().inventorySortDirection
      )
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al restaurar producto",
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
