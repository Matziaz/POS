/**
 * Global State (Zustand)
 * 
 * Estado compartido de la aplicación.
 * Mantén mínimo, usa custom hooks cuando sea posible.
 */

export { useProductStore } from './productStore'
export type { CreateProductInput, UpdateProductInput } from './productStore'
