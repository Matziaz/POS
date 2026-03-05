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

// ─── Tipos de datos planos que viajan por IPC ─────────────────────────────────

interface ProductJSON {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  providerId: string;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function productRowToJSON(row: any): ProductJSON {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    price: row.price,
    stock: row.stock,
    providerId: row.provider_id,
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
  };
}

function saleRowToJSON(row: any): SaleJSON {
  return {
    id: row.id,
    userId: row.user_id,
    total: row.total,
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
    items: (row.sale_item || []).map((si: any) => ({
      id: si.id,
      saleId: si.sale_id,
      productId: si.product_id,
      quantity: si.quantity,
      price: si.price,
    })),
  };
}

function movementRowToJSON(row: any): InventoryMovementJSON {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.type as "IN" | "OUT",
    quantity: row.quantity,
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
  };
}

// ─── Product handlers ─────────────────────────────────────────────────────────

function registerProductHandlers() {
  ipcMain.handle("product:list", async () => {
    const rows = await prisma.product.findMany({
      orderBy: { created_at: "desc" },
    });
    return rows.map(productRowToJSON);
  });

  ipcMain.handle("product:findById", async (_event, id: string) => {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? productRowToJSON(row) : null;
  });

  ipcMain.handle("product:findBySku", async (_event, sku: string) => {
    const row = await prisma.product.findUnique({ where: { sku } });
    return row ? productRowToJSON(row) : null;
  });

  ipcMain.handle("product:save", async (_event, data: ProductJSON) => {
    await prisma.product.upsert({
      where: { id: data.id },
      update: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        provider_id: data.providerId,
      },
      create: {
        id: data.id,
        name: data.name,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        provider_id: data.providerId,
        created_at: data.createdAt || new Date().toISOString(),
      },
    });
  });

  ipcMain.handle("product:delete", async (_event, id: string) => {
    const saleItemsCount = await prisma.sale_item.count({ where: { product_id: id } });
    const movementsCount = await prisma.inventory_movement.count({ where: { product_id: id } });
    if (saleItemsCount > 0 || movementsCount > 0) {
      throw new Error(`Cannot delete product; referenced by ${saleItemsCount} sale items and ${movementsCount} inventory movements`);
    }
    await prisma.product.delete({ where: { id } });
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
    const rows = await prisma.sale.findMany({
      include: { sale_item: true },
      orderBy: { created_at: "desc" },
    });
    return rows.map(saleRowToJSON);
  });

  ipcMain.handle("sale:findById", async (_event, id: string) => {
    const row = await prisma.sale.findUnique({
      where: { id },
      include: { sale_item: true },
    });
    return row ? saleRowToJSON(row) : null;
  });

  ipcMain.handle("sale:save", async (_event, data: SaleJSON) => {
    await prisma.sale.create({
      data: {
        id: data.id,
        user_id: data.userId,
        total: data.total,
        created_at: data.createdAt || new Date().toISOString(),
        sale_item: {
          create: data.items.map((item) => ({
            id: item.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  });
}

// ─── InventoryMovement handlers ───────────────────────────────────────────────

function registerInventoryMovementHandlers() {
  ipcMain.handle("inventoryMovement:save", async (_event, data: InventoryMovementJSON) => {
    await prisma.inventory_movement.create({
      data: {
        id: data.id,
        product_id: data.productId,
        type: data.type,
        quantity: data.quantity,
        created_at: data.createdAt || new Date().toISOString(),
      },
    });
  });

  ipcMain.handle("inventoryMovement:listByProduct", async (_event, productId: string) => {
    const rows = await prisma.inventory_movement.findMany({
      where: { product_id: productId },
      orderBy: { created_at: "desc" },
    });
    return rows.map(movementRowToJSON);
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
