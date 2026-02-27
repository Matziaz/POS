/**
 * Sales Store — Zustand
 * 
 * Estado global para la gestión de ventas.
 * Usa repositorios en memoria para desarrollo.
 */

import { create } from "zustand"
import { getSaleService, getSaleRepository, getProductRepository } from "@interface/dev/serviceFactory"

export interface SaleItemView {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  lineTotal: number
}

export interface SaleView {
  id: string
  userId: string
  total: number
  createdAt: string
  items: SaleItemView[]
}

export interface RegisterSaleLineInput {
  productSku: string
  qty: number
}

interface SaleState {
  sales: SaleView[]
  isLoading: boolean
  error: string | null
  selectedSale: SaleView | null

  fetchSales: () => Promise<void>
  registerSale: (lines: RegisterSaleLineInput[]) => Promise<void>
  setSelectedSale: (sale: SaleView | null) => void
  clearError: () => void
}

/**
 * Enriquece una venta con nombres de producto resolviendo IDs.
 */
async function enrichSaleItems(
  sale: { id: string; userId: string; total: number; createdAt: string; items: { id: string; saleId: string; productId: string; quantity: number; price: number }[] }
): Promise<SaleView> {
  const productRepo = getProductRepository()

  const items: SaleItemView[] = await Promise.all(
    sale.items.map(async (item) => {
      const product = await productRepo.findById(item.productId)
      return {
        id: item.id,
        productId: item.productId,
        productName: product?.name ?? "Producto desconocido",
        quantity: item.quantity,
        price: item.price,
        lineTotal: item.quantity * item.price,
      }
    })
  )

  return {
    id: sale.id,
    userId: sale.userId,
    total: sale.total,
    createdAt: sale.createdAt,
    items,
  }
}

export const useSaleStore = create<SaleState>((set, get) => ({
  sales: [],
  isLoading: false,
  error: null,
  selectedSale: null,

  fetchSales: async () => {
    set({ isLoading: true, error: null })
    try {
      const repo = getSaleRepository()
      const saleList = await repo.list()
      const enriched = await Promise.all(
        saleList.map((s) => enrichSaleItems(s.toJSON()))
      )
      // Ordenar por fecha descendente (más reciente primero)
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      set({ sales: enriched, isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al cargar ventas",
        isLoading: false,
      })
    }
  },

  registerSale: async (lines: RegisterSaleLineInput[]) => {
    set({ isLoading: true, error: null })
    try {
      const saleService = getSaleService()
      await saleService.registerSale({ lines })
      await get().fetchSales()
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error al registrar venta",
        isLoading: false,
      })
      throw err
    }
  },

  setSelectedSale: (sale: SaleView | null) => {
    set({ selectedSale: sale })
  },

  clearError: () => {
    set({ error: null })
  },
}))
