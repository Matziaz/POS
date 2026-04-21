/**
 * useProducts Hook
 * 
 * Hook que expone una API limpia para operaciones CRUD de productos.
 * Envuelve el store de Zustand y agrega carga inicial automática.
 */

import { useEffect } from "react"
import { useProductStore } from "@interface/store/productStore"
import type { CreateProductInput, UpdateProductInput } from "@interface/store/productStore"
import type { ProductProps } from "@core/entities"
import type { ProductListSortOptions } from "@core/repositories"

export interface UseProductsOptions {
  autoFetch?: boolean
}

export interface UseProductsReturn {
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
  selectProduct: (product: ProductProps | null) => void
  clearError: () => void
  refetch: () => Promise<void>
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const store = useProductStore()

  useEffect(() => {
    if (options.autoFetch !== false) {
      store.fetchProducts()
    }
    // Solo al montar el componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    products: store.products,
    deletedProducts: store.deletedProducts,
    inventoryProducts: store.inventoryProducts,
    inventoryTotal: store.inventoryTotal,
    inventoryPage: store.inventoryPage,
    inventoryPageSize: store.inventoryPageSize,
    inventorySortBy: store.inventorySortBy,
    inventorySortDirection: store.inventorySortDirection,
    isLoading: store.isLoading,
    isInventoryLoading: store.isInventoryLoading,
    error: store.error,
    selectedProduct: store.selectedProduct,
    fetchDeletedProducts: store.fetchDeletedProducts,
    fetchInventoryProducts: store.fetchInventoryProducts,
    addProduct: store.addProduct,
    updateProduct: store.updateProduct,
    deleteProduct: store.deleteProduct,
    restoreProduct: store.restoreProduct,
    selectProduct: store.setSelectedProduct,
    clearError: store.clearError,
    refetch: store.fetchProducts,
  }
}
