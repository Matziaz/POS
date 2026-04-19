/**
 * useSales Hook
 * 
 * Hook que expone una API limpia para visualización y registro de ventas.
 * Envuelve el store de Zustand y agrega carga inicial automática.
 */

import { useEffect } from "react"
import { useSaleStore } from "@interface/store/salesStore"
import type {
  SaleView,
  RegisterSaleLineInput,
  RegisterSalePaymentInput,
  RegisterSaleOptions,
  SaleHistoryFilters,
} from "@interface/store/salesStore"

export interface UseSalesReturn {
  sales: SaleView[]
  salesHistory: SaleView[]
  historyTotal: number
  historyPage: number
  historyPageSize: number
  historyFilters: SaleHistoryFilters
  isLoading: boolean
  error: string | null
  selectedSale: SaleView | null
  fetchSalesHistory: (page?: number, pageSize?: number, filters?: SaleHistoryFilters) => Promise<void>
  registerSale: (
    lines: RegisterSaleLineInput[],
    payments: RegisterSalePaymentInput[],
    options?: RegisterSaleOptions
  ) => Promise<void>
  selectSale: (sale: SaleView | null) => void
  clearError: () => void
  refetch: () => Promise<void>
}

export function useSales(options?: { autoFetch?: boolean }): UseSalesReturn {
  const store = useSaleStore()
  const autoFetch = options?.autoFetch ?? true

  useEffect(() => {
    if (autoFetch) {
      store.fetchSales()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch])

  return {
    sales: store.sales,
    salesHistory: store.salesHistory,
    historyTotal: store.historyTotal,
    historyPage: store.historyPage,
    historyPageSize: store.historyPageSize,
    historyFilters: store.historyFilters,
    isLoading: store.isLoading,
    error: store.error,
    selectedSale: store.selectedSale,
    fetchSalesHistory: store.fetchSalesHistory,
    registerSale: store.registerSale,
    selectSale: store.setSelectedSale,
    clearError: store.clearError,
    refetch: store.fetchSales,
  }
}
