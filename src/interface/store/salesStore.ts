/**
 * Sales Store — Zustand
 * 
 * Estado global para la gestión de ventas.
 * Usa repositorios en memoria para desarrollo.
 */

import { create } from "zustand"
import { getSaleService, getSaleRepository, getProductRepository } from "@interface/dev/serviceFactory"
import type { SaleListFilters } from "@core/repositories"

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
export interface RegisterSalePaymentInput {
  paymentMethodId: string
  amount: number
  tendered?: number
  changeDue?: number
}

export interface RegisterSaleOptions {
  cashRegisterId?: string
}

interface SaleState {
  sales: SaleView[]
  salesHistory: SaleView[]
  historyTotal: number
  historyPage: number
  historyPageSize: number
  historyFilters: SaleHistoryFilters
  isLoading: boolean
  error: string | null
  selectedSale: SaleView | null

  fetchSales: () => Promise<void>
  fetchSalesHistory: (page?: number, pageSize?: number, filters?: SaleHistoryFilters) => Promise<void>
  registerSale: (
    lines: RegisterSaleLineInput[],
    payments: RegisterSalePaymentInput[],
    options?: RegisterSaleOptions
  ) => Promise<void>
  setHistoryFilters: (filters: SaleHistoryFilters) => void
  setSelectedSale: (sale: SaleView | null) => void
  clearError: () => void
}


/**
 * Valida y normaliza los filtros de fecha para el historial de ventas.
 * Asegura que las fechas sean ISO válidas y que el rango sea lógico.
 */
export type SaleHistoryFilters = SaleListFilters

let latestHistoryRequestId = 0

function normalizeHistoryFilters(filters?: SaleHistoryFilters): SaleHistoryFilters {
  const fromISO = typeof filters?.fromISO === "string" && filters.fromISO.trim() ? filters.fromISO : undefined
  const toISO = typeof filters?.toISO === "string" && filters.toISO.trim() ? filters.toISO : undefined

  if (fromISO && Number.isNaN(new Date(fromISO).getTime())) {
    throw new Error("Filtro de fecha inicial invalido")
  }

  if (toISO && Number.isNaN(new Date(toISO).getTime())) {
    throw new Error("Filtro de fecha final invalido")
  }

  if (fromISO && toISO && new Date(fromISO).getTime() >= new Date(toISO).getTime()) {
    throw new Error("El rango de fechas es invalido: la fecha inicial debe ser menor a la final")
  }

  return { fromISO, toISO }
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
  salesHistory: [],
  historyTotal: 0,
  historyPage: 1,
  historyPageSize: 10,
  historyFilters: {},
  isLoading: false,
  error: null,
  selectedSale: null,

  fetchSales: async () => {
    set({ isLoading: true, error: null })
    try {
      const repo = getSaleRepository()
      const allSales = await repo.list()
      const enriched = await Promise.all(
        allSales.map((s) => enrichSaleItems(s.toJSON()))
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

  fetchSalesHistory: async (page?: number, pageSize?: number, filters?: SaleHistoryFilters) => {
    const requestId = ++latestHistoryRequestId
    set({ isLoading: true, error: null })
    try {
      const current = get()
      const requestedPage = page ?? current.historyPage
      const requestedPageSize = pageSize ?? current.historyPageSize
      const normalizedFilters = normalizeHistoryFilters(filters ?? current.historyFilters)
      const safePage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1
      const safePageSize = Number.isFinite(requestedPageSize) && requestedPageSize > 0 ? Math.floor(requestedPageSize) : 10

      const repo = getSaleRepository()
      const result = await repo.listPaginated(safePage, safePageSize, normalizedFilters)
      const enriched = await Promise.all(result.sales.map((s) => enrichSaleItems(s.toJSON())))

      if (requestId !== latestHistoryRequestId) return

      set({
        salesHistory: enriched,
        historyTotal: result.total,
        historyPage: safePage,
        historyPageSize: safePageSize,
        historyFilters: normalizedFilters,
        isLoading: false,
      })
    } catch (err) {
      if (requestId !== latestHistoryRequestId) return
      set({
        error: err instanceof Error ? err.message : "Error al cargar historial de ventas",
        isLoading: false,
      })
    }
  },

  registerSale: async (
    lines: RegisterSaleLineInput[],
    payments: RegisterSalePaymentInput[],
    options?: RegisterSaleOptions
  ) => {
    set({ isLoading: true, error: null })
    try {
      const saleService = getSaleService()
      await saleService.registerSale({
        lines,
        payments,
        cashRegisterId: options?.cashRegisterId,
      })
      await get().fetchSales()
      await get().fetchSalesHistory(get().historyPage, get().historyPageSize, get().historyFilters)
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

  setHistoryFilters: (filters: SaleHistoryFilters) => {
    set({ historyFilters: normalizeHistoryFilters(filters) })
  },

  clearError: () => {
    set({ error: null })
  },
}))
