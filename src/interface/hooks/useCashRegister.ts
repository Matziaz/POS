import { useEffect } from "react"
import { useCashRegisterStore } from "@interface/store/cashRegisterStore"

export interface UseCashRegisterOptions {
  autoFetch?: boolean
}

export function useCashRegister(options: UseCashRegisterOptions = {}) {
  const store = useCashRegisterStore()

  useEffect(() => {
    if (options.autoFetch !== false) {
      void store.fetchOpenCashRegister()
    }
  }, [])

  return {
    cashRegister: store.cashRegister,
    isLoading: store.isLoading,
    isOpening: store.isOpening,
    error: store.error,
    fetchOpenCashRegister: store.fetchOpenCashRegister,
    openCashRegister: store.openCashRegister,
    clearError: store.clearError,
  }
}
