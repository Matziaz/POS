/// <reference types="vite/client" />
import { ProductService, SaleService } from "@core/services";
import type { ProductRepository, SaleRepository, InventoryMovementRepository } from "@core/repositories";
import { defaultContext, resolvePosContext } from "@domain/contextos";

import { InMemoryProductRepository } from "./InMemoryProductRepository";
import { InMemorySaleRepository } from "./InMemorySaleRepository";
import { InMemoryInventoryMovementRepository } from "./InMemoryInventoryMovementRepository";

import { ElectronProductRepository } from "./ElectronProductRepository";
import { ElectronSaleRepository } from "./ElectronSaleRepository";
import { ElectronInventoryMovementRepository } from "./ElectronInventoryMovementRepository";

import { InMemorySalePaymentRepository } from "./InMemorySalePaymentRepository"
import { ElectronSalePaymentRepository } from "./ElectronSalePaymentRepository"
import type { SalePaymentRepository } from "@core/repositories"

/**
 * Detección de entorno:
 * - Si window.electronAPI existe → estamos en Electron → usar repos IPC (Prisma corre en main process)
 * - Si no → estamos en un browser puro (vite dev sin Electron) → usar InMemory
 *
 * PrismaClient NO puede correr en el renderer (browser). Por eso el IPC bridge.
 */
const isElectron = typeof window !== "undefined" && !!window.electronAPI;

// Singletons
const productRepository: ProductRepository = isElectron
  ? new ElectronProductRepository()
  : new InMemoryProductRepository();

const saleRepository: SaleRepository = isElectron
  ? new ElectronSaleRepository()
  : new InMemorySaleRepository();

const inventoryMovementRepository: InventoryMovementRepository = isElectron
  ? new ElectronInventoryMovementRepository()
  : new InMemoryInventoryMovementRepository();

const salePaymentRepository: SalePaymentRepository = isElectron
  ? new ElectronSalePaymentRepository()
  : new InMemorySalePaymentRepository();

let activeContextName = defaultContext.name;

if (isElectron) {
  void window.electronAPI?.configurationGet?.()
    .then((config) => {
      if (config?.retailContext) {
        activeContextName = config.retailContext;
      }
    })
    .catch(() => {
      activeContextName = defaultContext.name;
    });
}

function getActiveContext() {
  return resolvePosContext(activeContextName);
}

const productService = new ProductService(productRepository, inventoryMovementRepository, getActiveContext);
const saleService = new SaleService(productRepository, saleRepository, inventoryMovementRepository, salePaymentRepository, getActiveContext);

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

// DEV: log para verificar qué repositorio se está usando. Verificar con Ctrl+Shift+I en la app.
console.log('[serviceFactory] Electron detected:', isElectron);
console.log('[serviceFactory] Product repo =', productRepository.constructor.name);
console.log('[serviceFactory] Sale repo    =', saleRepository.constructor.name);
console.log('[serviceFactory] Active context =', activeContextName);