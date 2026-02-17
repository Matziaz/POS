/**
 * Constantes Globales
 * 
 * Valores que no cambian, sin hard-coding.
 */

export const APP_NAME = 'POS Adaptable'
export const APP_VERSION = '0.1.0'

// Errores
export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Producto no encontrado',
  INVALID_PRODUCT_NAME: 'Nombre de producto inválido',
  INVALID_PRICE: 'Precio inválido',
  INSUFFICIENT_STOCK: 'Stock insuficiente',
  INVALID_SALE: 'Venta inválida',
} as const

// UI
export const CURRENCY_SYMBOL = '$'
export const DECIMAL_PLACES = 2

// Limits
export const MAX_PRODUCT_NAME_LENGTH = 100
export const MAX_PRODUCTS_PER_SALE = 999
