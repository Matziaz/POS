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
import { Provider, User } from "../core/entities";
import { newId } from "../core/services/id";
import { PrismaProductRepository } from "../infrastructure/persistence/PrismaProductRepository";
import { PrismaSaleRepository } from "../infrastructure/persistence/PrismaSaleRepository";
import { PrismaInventoryMovementRepository } from "../infrastructure/persistence/PrismaInventoryMovementRepository";
import { PrismaProviderRepository } from "../infrastructure/persistence/PrismaProviderRepository";
import { PrismaUserRepository } from "../infrastructure/persistence/PrismaUserRepository";

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
const providerRepository = new PrismaProviderRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);

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

interface ProductTypeJSON {
  id: string;
  name: string;
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

interface ProviderJSON {
  id: string;
  name: string;
  telephone: string | null;
  email: string | null;
  productCount: number;
}

interface ProviderCreateJSON {
  id?: string;
  name: string;
  telephone?: string | null;
  email?: string | null;
  image?: string;
}

interface UserJSON {
  id: string;
  username: string;
  roleType: string;
  createdAt: string;
}

interface UserCreateJSON {
  id?: string;
  username: string;
  password: string;
  roleType: "ADMIN" | "CASHIER";
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

  ipcMain.handle("productType:list", async (): Promise<ProductTypeJSON[]> => {
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string | null; name: string }>>(
      'SELECT id, name FROM product_type WHERE id IS NOT NULL ORDER BY name ASC'
    );

    return rows
      .filter((row) => typeof row.id === "string" && row.id.trim().length > 0)
      .map((row) => ({
        id: row.id as string,
        name: row.name,
      }));
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

// ─── Contact handlers ─────────────────────────────────────────────────────────

function registerContactHandlers() {
  ipcMain.handle("provider:list", async (): Promise<ProviderJSON[]> => {
    const providers = await providerRepository.list();
    const ids = providers.map((provider) => provider.id);

    const counts = ids.length
      ? await prisma.product.groupBy({
          by: ["provider_id"],
          where: { provider_id: { in: ids } },
          _count: { provider_id: true },
        })
      : [];

    const countByProviderId = new Map<string, number>(
      counts.map((row) => [row.provider_id, row._count.provider_id])
    );

    return providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      telephone: provider.telephone,
      email: provider.email,
      productCount: countByProviderId.get(provider.id) ?? 0,
    }));
  });

  ipcMain.handle("provider:save", async (_event, data: ProviderCreateJSON): Promise<void> => {
    await providerRepository.save(
      Provider.create({
        id: data.id?.trim() || newId(),
        name: data.name,
        telephone: data.telephone ?? null,
        email: data.email ?? null,
        image: data.image?.trim() || "",
      })
    );
  });

  ipcMain.handle("user:list", async (): Promise<UserJSON[]> => {
    const users = await userRepository.list();
    const roleIds = [...new Set(users.map((user) => user.roleId))];
    const roles = roleIds.length
      ? await prisma.role.findMany({ where: { id: { in: roleIds } } })
      : [];
    const roleTypeById = new Map<string, string>(
      roles.map((role) => [role.id, role.type])
    );

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      roleType: roleTypeById.get(user.roleId) ?? "CASHIER",
      createdAt: user.createdAt,
    }));
  });

  ipcMain.handle("user:save", async (_event, data: UserCreateJSON): Promise<void> => {
    const normalizedRoleType = data.roleType.trim().toUpperCase();
    const role = await prisma.role.findFirst({ where: { type: normalizedRoleType } });

    if (!role) {
      throw new Error(`No existe un rol valido para ${normalizedRoleType}`);
    }

    await userRepository.save(
      User.create({
        id: data.id?.trim() || newId(),
        username: data.username,
        password: data.password,
        roleId: role.id,
      })
    );
  });
}

// ─── Register all ─────────────────────────────────────────────────────────────

export function registerAllIpcHandlers() {
  registerProductHandlers();
  registerSaleHandlers();
  registerInventoryMovementHandlers();
  registerContactHandlers();

  console.log("[IPC] All database handlers registered");
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
