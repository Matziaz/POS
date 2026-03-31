/**
 * IPC Handlers — Puente entre el renderer (React) y la base de datos (Prisma)
 * 
 * Este módulo registra todos los handlers de ipcMain que permiten
 * al renderer comunicarse con la capa de persistencia real.
 * 
 * Los datos viajan como JSON plano (serializable), no como instancias de clase.
 * El renderer reconstruye las entidades con los JSON recibidos.
 */

import { ipcMain, app } from "electron";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { Product } from "../core/entities/Product";
import { Sale } from "../core/entities/Sale";
import { InventoryMovement } from "../core/entities/InventoryMovement";
import { PrismaProductRepository } from "../infrastructure/persistence/PrismaProductRepository";
import { PrismaSaleRepository } from "../infrastructure/persistence/PrismaSaleRepository";
import { PrismaInventoryMovementRepository } from "../infrastructure/persistence/PrismaInventoryMovementRepository";

// Ruta absoluta a la base de datos SQLite.
// En dev: <proyecto>/prisma/pos.db
// En prod: se podría mover a app.getPath("userData")
const dbPath = path.join(app.getAppPath(), "prisma", "pos.db");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

const productRepository = new PrismaProductRepository(prisma);
const saleRepository = new PrismaSaleRepository(prisma);
const inventoryMovementRepository = new PrismaInventoryMovementRepository(prisma);

// ─── Tipos de datos planos que viajan por IPC ─────────────────────────────────

interface ProductJSON {
  id: string;
  sku: string;
  name: string;
  typeId: string;
  price: number;
  stock: number;
  providerId: string;
  image: string;
  createdAt: string;
}

interface SaleItemJSON {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
}

interface SaleJSON {
  id: string;
  userId: string;
  total: number;
  createdAt: string;
  items: SaleItemJSON[];
}

interface InventoryMovementJSON {
  id: string;
  productId: string;
  type: "IN" | "OUT";
  quantity: number;
  createdAt: string;
}

// ─── Product handlers ─────────────────────────────────────────────────────────

function registerProductHandlers() {
  ipcMain.handle("product:list", async () => {
    const products = await productRepository.list();
    return products.map((product) => product.toJSON());
  });

  ipcMain.handle("product:findById", async (_event, id: string) => {
    const product = await productRepository.findById(id);
    return product ? product.toJSON() : null;
  });

  ipcMain.handle("product:findBySku", async (_event, sku: string) => {
    const product = await productRepository.findBySku(sku);
    return product ? product.toJSON() : null;
  });

  ipcMain.handle("product:save", async (_event, data: ProductJSON) => {
    await productRepository.save(
      Product.create({
        ...data,
        typeId: typeof data.typeId === "string" && data.typeId.trim() ? data.typeId : "1",
      })
    );
  });

  ipcMain.handle("product:delete", async (_event, id: string) => {
    const saleItemsCount = await prisma.sale_item.count({ where: { product_id: id } });
    const movementsCount = await prisma.inventory_movement.count({ where: { product_id: id } });
    if (saleItemsCount > 0 || movementsCount > 0) {
      throw new Error(`Cannot delete product; referenced by ${saleItemsCount} sale items and ${movementsCount} inventory movements`);
    }
    await productRepository.delete(id);
  });

  // Force delete: elimina en transacción las dependencias y luego el producto.
  // Útil para limpiar registros del seeder o forzar borrados en entorno de desarrollo.
  ipcMain.handle("product:forceDelete", async (_event, id: string) => {
    await prisma.$transaction(async (tx) => {
      await tx.sale_item.deleteMany({ where: { product_id: id } });
      await tx.inventory_movement.deleteMany({ where: { product_id: id } });
      await tx.product.delete({ where: { id } });
    });
  });
}

// ─── Sale handlers ────────────────────────────────────────────────────────────

function registerSaleHandlers() {
  ipcMain.handle("sale:list", async () => {
    const sales = await saleRepository.list();
    return sales.map((sale) => sale.toJSON());
  });

  ipcMain.handle("sale:findById", async (_event, id: string) => {
    const sale = await saleRepository.findById(id);
    return sale ? sale.toJSON() : null;
  });

  ipcMain.handle("sale:save", async (_event, data: SaleJSON) => {
    await saleRepository.save(
      Sale.create({
        id: data.id,
        userId: data.userId,
        createdAt: data.createdAt,
        items: data.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      })
    );
  });
}

// ─── InventoryMovement handlers ───────────────────────────────────────────────

function registerInventoryMovementHandlers() {
  ipcMain.handle("inventoryMovement:save", async (_event, data: InventoryMovementJSON) => {
    await inventoryMovementRepository.save(InventoryMovement.create(data));
  });

  ipcMain.handle("inventoryMovement:listByProduct", async (_event, productId: string) => {
    const movements = await inventoryMovementRepository.listByProduct(productId);
    return movements.map((movement) => movement.toJSON());
  });
}

// ─── Register all ─────────────────────────────────────────────────────────────

export function registerAllIpcHandlers() {
  registerProductHandlers();
  registerSaleHandlers();
  registerInventoryMovementHandlers();

  console.log("[IPC] All database handlers registered");
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
