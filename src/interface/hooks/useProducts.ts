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

export interface UseProductsReturn {
  products: ProductProps[]
  isLoading: boolean
  error: string | null
  selectedProduct: ProductProps | null
  addProduct: (input: CreateProductInput) => Promise<void>
  updateProduct: (id: string, input: UpdateProductInput) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  selectProduct: (product: ProductProps | null) => void
  clearError: () => void
  refetch: () => Promise<void>
}

export function useProducts(): UseProductsReturn {
  const store = useProductStore()

  useEffect(() => {
    store.fetchProducts()
    // Solo al montar el componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    products: store.products,
    isLoading: store.isLoading,
    error: store.error,
    selectedProduct: store.selectedProduct,
    addProduct: store.addProduct,
    updateProduct: store.updateProduct,
    deleteProduct: store.deleteProduct,
    selectProduct: store.setSelectedProduct,
    clearError: store.clearError,
    refetch: store.fetchProducts,
  }
}
