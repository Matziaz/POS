/**
 * Service Factory — Desarrollo
 * 
 * Crea instancias de servicios con repositorios en memoria para desarrollo.
 * TODO: Reemplazar con inyección de dependencias real cuando infrastructure/ esté listo.
 */

import { ProductService } from "@core/services"
import { InMemoryProductRepository } from "./InMemoryProductRepository"

// Singleton: misma instancia compartida en toda la app
const productRepository = new InMemoryProductRepository()
const productService = new ProductService(productRepository)

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
