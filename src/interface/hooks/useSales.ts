/**
 * useSales Hook
 * 
 * Hook que expone una API limpia para visualización y registro de ventas.
 * Envuelve el store de Zustand y agrega carga inicial automática.
 */

import { useEffect } from "react"
import { useSaleStore } from "@interface/store/salesStore"
import type { SaleView, RegisterSaleLineInput,RegisterSalePaymentInput } from "@interface/store/salesStore"

export interface UseSalesReturn {
  sales: SaleView[]
  isLoading: boolean
  error: string | null
  selectedSale: SaleView | null
  registerSale: (lines: RegisterSaleLineInput[],payments:RegisterSalePaymentInput[]) => Promise<void>
  selectSale: (sale: SaleView | null) => void
  clearError: () => void
  refetch: () => Promise<void>
}

export function useSales(): UseSalesReturn {
  const store = useSaleStore()

  useEffect(() => {
    store.fetchSales()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    sales: store.sales,
    isLoading: store.isLoading,
    error: store.error,
    selectedSale: store.selectedSale,
    registerSale: store.registerSale,
    selectSale: store.setSelectedSale,
    clearError: store.clearError,
    refetch: store.fetchSales,
  }
}
