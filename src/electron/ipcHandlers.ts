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
import { CashRegister } from "../core/entities/CashRegister";
import { AdminSetupService, CashClosureService, ConfigurationService } from "../core/services";
import { newId } from "../core/services/id";
import { PrismaProductRepository } from "../infrastructure/persistence/PrismaProductRepository";
import { PrismaProductTypeRepository } from "../infrastructure/persistence/PrismaProductTypeRepository";
import { PrismaRoleRepository } from "../infrastructure/persistence/PrismaRoleRepository";
import { PrismaSaleRepository } from "../infrastructure/persistence/PrismaSaleRepository";
import { PrismaInventoryMovementRepository } from "../infrastructure/persistence/PrismaInventoryMovementRepository";
import { PrismaProviderRepository } from "../infrastructure/persistence/PrismaProviderRepository";
import { PrismaUserRepository } from "../infrastructure/persistence/PrismaUserRepository";
import { PrismaAppConfigurationRepository } from "../infrastructure/persistence/PrismaAppConfigurationRepository";
import { PrismaCashRegisterRepository } from "../infrastructure/persistence/PrismaCashRegisterRepository";
import { PrismaPaymentMethodRepository } from "../infrastructure/persistence/PrismaPaymentMethodRepository";
import { PrismaCashClosureRepository } from "../infrastructure/persistence/PrismaCashClosureRepository";
import { PrismaCashClosurePaymentBreakdownRepository } from "../infrastructure/persistence/PrismaCashClosurePaymentBreakdownRepository";
import { PrismaSalePaymentRepository } from "../infrastructure/persistence/PrismaSalePaymentRepository";
import { SalePayment } from "../core/entities/SalePayment";


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
const productTypeRepository = new PrismaProductTypeRepository(prisma);
const roleRepository = new PrismaRoleRepository(prisma);
const appConfigurationRepository = new PrismaAppConfigurationRepository(prisma);
const cashRegisterRepository = new PrismaCashRegisterRepository(prisma);
const cashClosureRepository = new PrismaCashClosureRepository(prisma);
const cashClosureBreakdownRepository = new PrismaCashClosurePaymentBreakdownRepository(prisma);
const salePaymentRepository = new PrismaSalePaymentRepository(prisma);
const paymentMethodRepository = new PrismaPaymentMethodRepository(prisma);
const adminSetupService = new AdminSetupService(productTypeRepository, roleRepository);
const configurationService = new ConfigurationService(appConfigurationRepository);
const cashClosureService = new CashClosureService(
  saleRepository,
  salePaymentRepository,
  cashClosureRepository,
  cashClosureBreakdownRepository,
  cashRegisterRepository,
);

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
  deletedAt: string | null;
}

interface ProductTypeJSON {
  id: string;
  name: string;
}

interface ProductTypeCreateJSON {
  name: string;
}

interface ProductTypeUpdateJSON {
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
  cashRegisterId?: string | null;
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

interface ProviderUpdateJSON {
  id: string;
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

interface UserUpdateJSON {
  id: string;
  username: string;
  password?: string;
  roleType: "ADMIN" | "CASHIER";
}

interface RoleJSON {
  id: string;
  type: string;
}

interface RoleCreateJSON {
  type: string;
}

interface RoleUpdateJSON {
  id: string;
  type: string;
}

interface ConfigurationJSON {
  id: string;
  retailContext: string;
  isActive: string | number | null;
}

interface ConfigurationCreateJSON {
  retailContext: string;
}

interface CashRegisterJSON {
  id: string;
  openingAmount: number;
  status: string;
  openedAt: string;
  openedByUserId: string;
}

interface CashRegisterCreateJSON {
  openingAmount: number;
  openedByUserId?: string;
}

interface CashClosureJSON {
  id: string;
  folio: string;
  businessDate: string;
  openedAt: string;
  closedAt: string;
  salesCount: number;
  totalAmount: number;
  isFinal: number;
  userId: string | null;
  notes: string | null;
  createdAt: string;
}

interface CashClosurePaymentBreakdownJSON {
  id: string;
  cashClosureId: string;
  paymentMethodId: string;
  totalAmount: number;
}

interface CashClosureCloseJSON {
  closedAt?: string;
  businessDate?: string;
  userId?: string;
  notes?: string;
  isFinal?: boolean;
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

  ipcMain.handle("product:listDeleted", async () => {
    const products = await productRepository.listDeleted();
    return products.map((product) => product.toJSON());
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
    await productRepository.delete(id);
  });

  ipcMain.handle("product:restore", async (_event, id: string, stock: number) => {
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error("Stock must be a non-negative integer");
    }
    await productRepository.restore(id, stock);
  });

  // Force delete: elimina en transacción las dependencias y luego el producto.
  // Útil para limpiar registros del seeder o forzar borrados en entorno de desarrollo.
  ipcMain.handle("product:forceDelete", async (_event, id: string) => {
    await prisma.$transaction(async (tx: any) => {
      await tx.sale_item.deleteMany({ where: { product_id: id } });
      await tx.inventory_movement.deleteMany({ where: { product_id: id } });
      await tx.product.delete({ where: { id } });
    });
  });

  ipcMain.handle("productType:list", async (): Promise<ProductTypeJSON[]> => {
    const rows = await adminSetupService.listProductTypes();
    return rows.map((row) => row.toJSON());
  });

  ipcMain.handle("productType:listDeleted", async (): Promise<ProductTypeJSON[]> => {
    const rows = await adminSetupService.listDeletedProductTypes();
    return rows.map((row) => row.toJSON());
  });

  ipcMain.handle("productType:create", async (_event, data: ProductTypeCreateJSON): Promise<void> => {
    await adminSetupService.createProductType({ name: data.name });
  });

  ipcMain.handle("productType:update", async (_event, data: ProductTypeUpdateJSON): Promise<void> => {
    await adminSetupService.updateProductType({ id: data.id, name: data.name });
  });

  ipcMain.handle("productType:delete", async (_event, id: string): Promise<void> => {
    await adminSetupService.deleteProductType(id);
  });

  ipcMain.handle("productType:restore", async (_event, id: string): Promise<void> => {
    await adminSetupService.restoreProductType(id);
  });

}

// ─── Sale handlers ────────────────────────────────────────────────────────────

function registerSaleHandlers() {
  ipcMain.handle("sale:list", async () => {
    const sales = await saleRepository.list();
    return sales.map((sale) => sale.toJSON());
  });

  ipcMain.handle("sale:listByDateRange", async (_event, fromISO: string, toISO: string) => {
    const sales = await saleRepository.findByDateRange(new Date(fromISO), new Date(toISO));
    return sales.map((sale) => sale.toJSON());
  });

  ipcMain.handle("sale:sumByDateRange", async (_event, fromISO: string, toISO: string) => {
    return saleRepository.sumTotalByDateRange(new Date(fromISO), new Date(toISO));
  });

  ipcMain.handle("sale:countByDateRange", async (_event, fromISO: string, toISO: string) => {
    return saleRepository.countByDateRange(new Date(fromISO), new Date(toISO));
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
        cashRegisterId: data.cashRegisterId,
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
          where: { provider_id: { in: ids }, deleted_at: null },
          _count: { provider_id: true },
        })
      : [];

    const countByProviderId = new Map<string, number>(
      counts.map((row: any) => [row.provider_id, row._count.provider_id])
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

  ipcMain.handle("provider:update", async (_event, data: ProviderUpdateJSON): Promise<void> => {
    const existingProvider = await providerRepository.findById(data.id);

    if (!existingProvider) {
      throw new Error("No se encontro el proveedor a actualizar");
    }

    await providerRepository.update(
      Provider.create({
        id: data.id,
        name: data.name,
        telephone: data.telephone ?? null,
        email: data.email ?? null,
        image: data.image?.trim() || existingProvider.image,
      })
    );
  });

  ipcMain.handle("provider:delete", async (_event, id: string): Promise<void> => {
    const productsCount = await prisma.product.count({ where: { provider_id: id } });

    if (productsCount > 0) {
      throw new Error(`No se puede eliminar el proveedor; tiene ${productsCount} producto(s) asociado(s)`);
    }

    await providerRepository.delete(id);
  });

  ipcMain.handle("user:list", async (): Promise<UserJSON[]> => {
    const users = await userRepository.list();
    const roleIds = [...new Set(users.map((user) => user.roleId))];
    const roles = roleIds.length
      ? await prisma.role.findMany({ where: { id: { in: roleIds } } })
      : [];
    const roleTypeById = new Map<string, string>(
      roles.map((role: any) => [role.id, role.type])
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

  ipcMain.handle("user:update", async (_event, data: UserUpdateJSON): Promise<void> => {
    const normalizedRoleType = data.roleType.trim().toUpperCase();
    const role = await prisma.role.findFirst({ where: { type: normalizedRoleType } });

    if (!role) {
      throw new Error(`No existe un rol valido para ${normalizedRoleType}`);
    }

    const existingUser = await userRepository.findById(data.id);

    if (!existingUser) {
      throw new Error("No se encontro el usuario a actualizar");
    }

    await userRepository.update(
      User.create({
        id: data.id,
        username: data.username,
        password: data.password?.trim() || existingUser.password,
        roleId: role.id,
        createdAt: existingUser.createdAt,
      })
    );
  });

  ipcMain.handle("user:delete", async (_event, id: string): Promise<void> => {
    const salesCount = await prisma.sale.count({ where: { user_id: id } });

    if (salesCount > 0) {
      throw new Error(`No se puede eliminar el usuario; tiene ${salesCount} venta(s) registrada(s)`);
    }

    await userRepository.delete(id);
  });

  ipcMain.handle("role:list", async (): Promise<RoleJSON[]> => {
    const roles = await adminSetupService.listRoles();
    return roles.map((role) => role.toJSON());
  });

  ipcMain.handle("role:create", async (_event, data: RoleCreateJSON): Promise<void> => {
    await adminSetupService.createRole({ type: data.type });
  });

  ipcMain.handle("role:update", async (_event, data: RoleUpdateJSON): Promise<void> => {
    await adminSetupService.updateRole({ id: data.id, type: data.type });
  });

  ipcMain.handle("role:delete", async (_event, id: string): Promise<void> => {
    await adminSetupService.deleteRole(id);
  });
}

// ─── Configuration handlers ───────────────────────────────────────────────────

function registerConfigurationHandlers() {
  ipcMain.handle("configuration:listContexts", async (): Promise<string[]> => {
    return configurationService.listAvailableContexts();
  });

  ipcMain.handle("configuration:get", async (): Promise<ConfigurationJSON | null> => {
    const config = await configurationService.getConfiguration();
    return config ? config.toJSON() : null;
  });

  ipcMain.handle("configuration:isSetupComplete", async (): Promise<boolean> => {
    return configurationService.isSetupComplete();
  });

  ipcMain.handle("configuration:saveInitial", async (_event, data: ConfigurationCreateJSON): Promise<ConfigurationJSON> => {
    const saved = await configurationService.saveInitialConfiguration({
      retailContext: data.retailContext,
    });
    return saved.toJSON();
  });
}

function registerCashRegisterHandlers() {
  ipcMain.handle("cashRegister:getOpen", async (): Promise<CashRegisterJSON | null> => {
    const opened = await cashRegisterRepository.findOpen();
    return opened ? opened.toJSON() : null;
  });

  ipcMain.handle("cashRegister:open", async (_event, data: CashRegisterCreateJSON): Promise<CashRegisterJSON> => {
    const alreadyOpen = await cashRegisterRepository.findOpen();
    if (alreadyOpen) {
      throw new Error("Ya existe una caja abierta");
    }

    const openingAmount = Number(data.openingAmount);
    if (!Number.isFinite(openingAmount) || openingAmount < 0) {
      throw new Error("El monto de apertura debe ser un numero mayor o igual a 0");
    }

    const created = CashRegister.create({
      id: newId(),
      openingAmount,
      status: "open",
      openedByUserId: data.openedByUserId?.trim() || "user_cashier_001",
    });

    await cashRegisterRepository.save(created);
    return created.toJSON();
  });
}
function registerPaymentMethodHandlers() {
  ipcMain.handle("paymentMethod:listActive", async () => {
     const methods = await paymentMethodRepository.listActive()
     return methods.map((m) => m.toJSON())
  })
}

function registerSalePaymentHandlers() {
  ipcMain.handle("salePayment:save", async (_event, data: any) => {
    await salePaymentRepository.save(
      SalePayment.create({
        id: data.id,
        saleId: data.saleId,
        paymentMethodId: data.paymentMethodId,
        amount: data.amount,
        tendered: data.tendered ?? null,
        changeDue: data.changeDue ?? null,
      })
    );
  });

  ipcMain.handle("salePayment:listBySaleId", async (_event, saleId: string) => {
    const payments = await salePaymentRepository.listBySaleId(saleId);
    return payments.map((payment) => payment.toJSON());
  });
}

function registerCashClosureHandlers() {
  ipcMain.handle("cashClosure:close", async (_event, data: CashClosureCloseJSON) => {
    const result = await cashClosureService.closeDaily({
      closedAt: data.closedAt,
      businessDate: data.businessDate,
      userId: data.userId,
      notes: data.notes,
      isFinal: data.isFinal,
    });

    return {
      closure: result.closure.toJSON() as CashClosureJSON,
      breakdown: result.breakdown.map((item) => item.toJSON()) as CashClosurePaymentBreakdownJSON[],
    };
  });

  ipcMain.handle("cashClosure:listByDateRange", async (_event, fromISO: string, toISO: string) => {
    const rows = await cashClosureRepository.listByBusinessDateRange(fromISO, toISO);
    return rows.map((row) => row.toJSON() as CashClosureJSON);
  });
}

// ─── Register all ─────────────────────────────────────────────────────────────

export function registerAllIpcHandlers() {
  registerProductHandlers();
  registerSaleHandlers();
  registerInventoryMovementHandlers();
  registerContactHandlers();
  registerConfigurationHandlers();
  registerCashRegisterHandlers();
  registerSalePaymentHandlers();
  registerPaymentMethodHandlers();
  registerCashClosureHandlers();
  console.log("[IPC] All database handlers registered");
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
