import { create } from "zustand"
import type { ProductProps } from "@core/entities"

export interface SaleSessionLine {
  productSku: string
  productName: string
  price: number
  stock: number
  qty: number
}

interface SaleSessionState {
  lines: SaleSessionLine[]
  addProduct: (product: ProductProps) => void
  incrementQty: (sku: string) => void
  decrementQty: (sku: string) => void
  removeLine: (sku: string) => void
  clear: () => void
}

export const useSaleSessionStore = create<SaleSessionState>((set) => ({
  lines: [],

  addProduct: (product: ProductProps) => {
    if (product.stock <= 0) return

    set((state) => {
      const existing = state.lines.find((line) => line.productSku === product.sku)

      if (existing) {
        return {
          lines: state.lines.map((line) => {
            if (line.productSku !== product.sku) return line
            return { ...line, qty: Math.min(line.qty + 1, line.stock) }
          }),
        }
      }

      return {
        lines: [
          ...state.lines,
          {
            productSku: product.sku,
            productName: product.name,
            price: product.price,
            stock: product.stock,
            qty: 1,
          },
        ],
      }
    })
  },

  incrementQty: (sku: string) => {
    set((state) => ({
      lines: state.lines.map((line) => {
        if (line.productSku !== sku) return line
        return { ...line, qty: Math.min(line.qty + 1, line.stock) }
      }),
    }))
  },

  decrementQty: (sku: string) => {
    set((state) => ({
      lines: state.lines
        .map((line) => {
          if (line.productSku !== sku) return line
          return { ...line, qty: line.qty - 1 }
        })
        .filter((line) => line.qty > 0),
    }))
  },

  removeLine: (sku: string) => {
    set((state) => ({
      lines: state.lines.filter((line) => line.productSku !== sku),
    }))
  },

  clear: () => {
    set({ lines: [] })
  },
}))
