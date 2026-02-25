/**
 * Service Factory — Desarrollo
 * 
 * Crea instancias de servicios con repositorios en memoria para desarrollo.
 * TODO: Reemplazar con inyección de dependencias real cuando infrastructure/ esté listo.
 */

import { ProductService, SaleService } from "@core/services"
import { InMemoryProductRepository } from "./InMemoryProductRepository"
import { InMemorySaleRepository } from "./InMemorySaleRepository"
import { InMemoryInventoryMovementRepository } from "./InMemoryInventoryMovementRepository"

// Singletons: misma instancia compartida en toda la app
const productRepository = new InMemoryProductRepository()
const saleRepository = new InMemorySaleRepository()
const inventoryMovementRepository = new InMemoryInventoryMovementRepository()

const productService = new ProductService(productRepository)
const saleService = new SaleService(productRepository, saleRepository, inventoryMovementRepository)

// --- Products ---

export function getProductService(): ProductService {
  return productService
}

/**
 * Acceso directo al repositorio para operaciones que ProductService aún no soporta
 * (update, delete). Cuando Fer agregue estos métodos al servicio, eliminar este export.
 */
export function getProductRepository(): InMemoryProductRepository {
  return productRepository
}

// --- Sales ---

export function getSaleService(): SaleService {
  return saleService
}

export function getSaleRepository(): InMemorySaleRepository {
  return saleRepository
}
