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
export type Id = string; // Placeholder, en producción usar UUID u otro formato específico
export type ISODateString = string; // YYYY-MM-DD, para simplificar. En producción, usar Date o librería específica.