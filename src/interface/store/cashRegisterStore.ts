import { create } from "zustand"

export interface OpenCashRegisterView {
  id: string
  openingAmount: number
  status: string
  openedAt: string
  openedByUserId: string
}

interface OpenCashRegisterInput {
  openingAmount: number
  openedByUserId?: string
}

interface CashRegisterState {
  cashRegister: OpenCashRegisterView | null
  isLoading: boolean
  isOpening: boolean
  error: string | null

  fetchOpenCashRegister: () => Promise<void>
  openCashRegister: (input: OpenCashRegisterInput) => Promise<OpenCashRegisterView>
  clearError: () => void
}

export const useCashRegisterStore = create<CashRegisterState>((set) => ({
  cashRegister: null,
  isLoading: false,
  isOpening: false,
  error: null,

  fetchOpenCashRegister: async () => {
    set({ isLoading: true, error: null })

    try {
      if (!window.electronAPI?.cashRegisterGetOpen) {
        throw new Error("IPC de caja no disponible")
      }

      const opened = await window.electronAPI.cashRegisterGetOpen()
      set({ cashRegister: opened ?? null, isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "No fue posible validar el estado de caja",
        isLoading: false,
      })
    }
  },

  openCashRegister: async (input: OpenCashRegisterInput) => {
    set({ isOpening: true, error: null })

    try {
      if (!window.electronAPI?.cashRegisterOpen) {
        throw new Error("IPC de apertura de caja no disponible")
      }

      const opened = await window.electronAPI.cashRegisterOpen({
        openingAmount: input.openingAmount,
        openedByUserId: input.openedByUserId,
      })

      if (!opened) {
        throw new Error("No se pudo abrir la caja")
      }

      set({ cashRegister: opened, isOpening: false })
      return opened
    } catch (err) {
      const message = err instanceof Error ? err.message : "No fue posible abrir la caja"
      set({ error: message, isOpening: false })
      throw err
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
