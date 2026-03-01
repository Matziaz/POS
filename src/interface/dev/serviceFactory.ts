/// <reference types="vite/client" />
import { ProductService, SaleService } from "@core/services";
import type { ProductRepository, SaleRepository, InventoryMovementRepository } from "@core/repositories";

import { InMemoryProductRepository } from "./InMemoryProductRepository";
import { InMemorySaleRepository } from "./InMemorySaleRepository";
import { InMemoryInventoryMovementRepository } from "./InMemoryInventoryMovementRepository";

import { PrismaProductRepository } from "@infrastructure/persistence/PrismaProductRepository";
// (cuando tengas PrismaSaleRepository, PrismaInventoryMovementRepository, los metes también)

const isDev = import.meta.env.DEV;

// Singletons
/** Error en app al intentar reemplazar InMemoryProductRepository por PrismaProductRepository:
 * PrismaClient is unable to run in this browser environment, 
 * or has been bundled for the browser (running in ``). 
 * If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report
 * 
 * Se intentó const 'productRepository: ProductRepository = new PrismaProductRepository()' pero falla

 |
 v                                                                                                        */
 
const productRepository: ProductRepository = isDev
  ? new InMemoryProductRepository()
  : new PrismaProductRepository();

// Por ahora sales siguen en-memory si no tienes repos Prisma aún:
const saleRepository: SaleRepository = new InMemorySaleRepository();
const inventoryMovementRepository: InventoryMovementRepository = new InMemoryInventoryMovementRepository();

const productService = new ProductService(productRepository);
const saleService = new SaleService(productRepository, saleRepository, inventoryMovementRepository);

export function getProductService(): ProductService {
  return productService;
}
export function getProductRepository(): ProductRepository {
  return productRepository;
}
export function getSaleService(): SaleService {
  return saleService;
}
export function getSaleRepository(): SaleRepository {
  return saleRepository;
}

// DEV: log para verificar qué repositorio se está usando. Verificar con Ctrl+shifts+I en la app.
// Sale InMemoryPRoductRepository, entonces aún no está conectado a DB
console.log('[serviceFactory] Product repo =', productRepository.constructor.name);