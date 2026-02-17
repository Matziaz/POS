/**
 * Tipos Compartidos
 * 
 * Tipos que se usan en múltiples capas.
 * Ej: Money, UUID, etc.
 */

export type Money = number // En producción, usar librería específica (decimal.js)
export type UUID = string & { readonly __brand: 'UUID' }
export type SKU = string & { readonly __brand: 'SKU' }

// Placeholder: Otros tipos compartidos
