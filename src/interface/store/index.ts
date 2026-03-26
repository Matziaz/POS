/**
 * Global State (Zustand)
 * 
 * Estado compartido de la aplicación.
 * Mantén mínimo, usa custom hooks cuando sea posible.
 */

export { useProductStore } from './productStore'
export type { CreateProductInput, UpdateProductInput } from './productStore'
export { useSaleStore } from './salesStore'
export type { SaleView, SaleItemView, RegisterSaleLineInput } from './salesStore'
export { useSaleSessionStore } from './saleSessionStore'
export type { SaleSessionLine } from './saleSessionStore'
