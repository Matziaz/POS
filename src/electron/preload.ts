/**
 * Preload script — Expone la API de IPC al renderer via contextBridge
 * 
 * Este archivo corre en un contexto aislado entre el proceso main y el renderer.
 * Solo expone los canales IPC necesarios, manteniendo la seguridad de Electron.
 */

import { contextBridge, ipcRenderer } from "electron";

// ─── Tipos planos (JSON serializable) para las APIs ───────────────────────────

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

interface ProductListSortOptionsJSON {
  sortBy?: "createdAt" | "name" | "sku" | "price" | "stock" | "typeId";
  sortDirection?: "asc" | "desc";
}

interface ProductTypeJSON {
  id: string;
  name: string;
  deletedAt?: string | null;
}

interface ProductTypeCreateJSON {
  name: string;
}

interface ProductTypeUpdateJSON {
  id: string;
  name: string;
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

interface SaleListFiltersJSON {
  fromISO?: string;
  toISO?: string;
}

interface InventoryMovementJSON {
  id: string;
  productId: string;
  type: "IN" | "OUT";
  quantity: number;
  createdAt: string;
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

interface SalePaymentJSON {
  id: string;
  saleId: string;
  paymentMethodId: string;
  amount: number;
  tendered: number | null;
  changeDue: number | null;
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

interface CashClosureCloseResultJSON {
  closure: CashClosureJSON;
  breakdown: CashClosurePaymentBreakdownJSON[];
}

interface PaymentMethodJSON {
  id: string;
  method: string;
  isCash: number;
  isActive: number;
  displayOrder: number | null;
}

interface PaymentMethodCreateJSON {
  method: string;
  isCash: number;
  displayOrder?: number | null;
}

interface PaymentMethodUpdateJSON {
  id: string;
  method: string;
  displayOrder?: number | null;
}

// ─── API expuesta al renderer como window.electronAPI ─────────────────────────

const electronAPI = {
  // Products
  productList: (): Promise<ProductJSON[]> =>
    ipcRenderer.invoke("product:list"),
  productListPaginated: (
    page: number,
    pageSize: number,
    options?: ProductListSortOptionsJSON
  ): Promise<{ products: ProductJSON[]; total: number }> =>
    ipcRenderer.invoke("product:listPaginated", page, pageSize, options),
  productFindById: (id: string): Promise<ProductJSON | null> =>
    ipcRenderer.invoke("product:findById", id),
  productFindBySku: (sku: string): Promise<ProductJSON | null> =>
    ipcRenderer.invoke("product:findBySku", sku),
  productListDeleted: (): Promise<ProductJSON[]> =>
    ipcRenderer.invoke("product:listDeleted"),
  productSave: (data: ProductJSON): Promise<void> =>
    ipcRenderer.invoke("product:save", data),
  productDelete: (id: string): Promise<void> =>
    ipcRenderer.invoke("product:delete", id),
  productRestore: (id: string, stock: number): Promise<void> =>
    ipcRenderer.invoke("product:restore", id, stock),
  productTypeList: (): Promise<ProductTypeJSON[]> =>
    ipcRenderer.invoke("productType:list"),
  productTypeListDeleted: (): Promise<ProductTypeJSON[]> =>
    ipcRenderer.invoke("productType:listDeleted"),
  productTypeCreate: (data: ProductTypeCreateJSON): Promise<void> =>
    ipcRenderer.invoke("productType:create", data),
  productTypeUpdate: (data: ProductTypeUpdateJSON): Promise<void> =>
    ipcRenderer.invoke("productType:update", data),
  productTypeDelete: (id: string): Promise<void> =>
    ipcRenderer.invoke("productType:delete", id),
  productTypeRestore: (id: string): Promise<void> =>
    ipcRenderer.invoke("productType:restore", id),
  roleList: (): Promise<RoleJSON[]> =>
    ipcRenderer.invoke("role:list"),
  roleCreate: (data: RoleCreateJSON): Promise<void> =>
    ipcRenderer.invoke("role:create", data),
  roleUpdate: (data: RoleUpdateJSON): Promise<void> =>
    ipcRenderer.invoke("role:update", data),
  roleDelete: (id: string): Promise<void> =>
    ipcRenderer.invoke("role:delete", id),
  providerList: (): Promise<ProviderJSON[]> =>
    ipcRenderer.invoke("provider:list"),
  providerSave: (data: ProviderCreateJSON): Promise<void> =>
    ipcRenderer.invoke("provider:save", data),
  providerUpdate: (data: ProviderUpdateJSON): Promise<void> =>
    ipcRenderer.invoke("provider:update", data),
  providerDelete: (id: string): Promise<void> =>
    ipcRenderer.invoke("provider:delete", id),
  userList: (): Promise<UserJSON[]> =>
    ipcRenderer.invoke("user:list"),
  userSave: (data: UserCreateJSON): Promise<void> =>
    ipcRenderer.invoke("user:save", data),
  userUpdate: (data: UserUpdateJSON): Promise<void> =>
    ipcRenderer.invoke("user:update", data),
  userDelete: (id: string): Promise<void> =>
    ipcRenderer.invoke("user:delete", id),

  // Sales
  saleList: (): Promise<SaleJSON[]> =>
    ipcRenderer.invoke("sale:list"),
  saleListByDateRange: (fromISO: string, toISO: string): Promise<SaleJSON[]> =>
    ipcRenderer.invoke("sale:listByDateRange", fromISO, toISO),
  saleSumByDateRange: (fromISO: string, toISO: string): Promise<number> =>
    ipcRenderer.invoke("sale:sumByDateRange", fromISO, toISO),
  saleCountByDateRange: (fromISO: string, toISO: string): Promise<number> =>
    ipcRenderer.invoke("sale:countByDateRange", fromISO, toISO),
  saleFindById: (id: string): Promise<SaleJSON | null> =>
    ipcRenderer.invoke("sale:findById", id),
  saleSave: (data: SaleJSON): Promise<void> =>
    ipcRenderer.invoke("sale:save", data),
  saleListPaginated: (page: number, pageSize: number, filters?: SaleListFiltersJSON): Promise<{ sales: SaleJSON[]; total: number }> =>
    ipcRenderer.invoke("sale:listPaginated", page, pageSize, filters),

  // Inventory Movements
  inventoryMovementSave: (data: InventoryMovementJSON): Promise<void> =>
    ipcRenderer.invoke("inventoryMovement:save", data),
  inventoryMovementListByProduct: (productId: string): Promise<InventoryMovementJSON[]> =>
    ipcRenderer.invoke("inventoryMovement:listByProduct", productId),

  // App Configuration
  configurationListContexts: (): Promise<string[]> =>
    ipcRenderer.invoke("configuration:listContexts"),
  configurationGet: (): Promise<ConfigurationJSON | null> =>
    ipcRenderer.invoke("configuration:get"),
  configurationIsSetupComplete: (): Promise<boolean> =>
    ipcRenderer.invoke("configuration:isSetupComplete"),
  configurationSaveInitial: (data: ConfigurationCreateJSON): Promise<ConfigurationJSON> =>
    ipcRenderer.invoke("configuration:saveInitial", data),

  // Cash Register
  cashRegisterGetOpen: (): Promise<CashRegisterJSON | null> =>
    ipcRenderer.invoke("cashRegister:getOpen"),
  cashRegisterOpen: (data: CashRegisterCreateJSON): Promise<CashRegisterJSON> =>
    ipcRenderer.invoke("cashRegister:open", data),

  // Cash Closure
  cashClosureClose: (data: CashClosureCloseJSON): Promise<CashClosureCloseResultJSON> =>
    ipcRenderer.invoke("cashClosure:close", data),
  cashClosureListByDateRange: (fromISO: string, toISO: string): Promise<CashClosureJSON[]> =>
    ipcRenderer.invoke("cashClosure:listByDateRange", fromISO, toISO),

  // Payment Methods
  paymentMethodListActive: (): Promise<PaymentMethodJSON[]> =>
    ipcRenderer.invoke("paymentMethod:listActive"),
  paymentMethodList: (): Promise<PaymentMethodJSON[]> =>
    ipcRenderer.invoke("paymentMethod:list"),
  paymentMethodCreate: (data: PaymentMethodCreateJSON): Promise<PaymentMethodJSON> =>
    ipcRenderer.invoke("paymentMethod:create", data),
  paymentMethodUpdate: (data: PaymentMethodUpdateJSON): Promise<void> =>
    ipcRenderer.invoke("paymentMethod:update", data),
  paymentMethodToggleActive: (id: string): Promise<PaymentMethodJSON> =>
    ipcRenderer.invoke("paymentMethod:toggleActive", id),

  // Sale Payments
  salePaymentSave: (data: SalePaymentJSON): Promise<void> =>
     ipcRenderer.invoke("salePayment:save", data),
  salePaymentListBySaleId: (saleId: string): Promise<SalePaymentJSON[]> =>
     ipcRenderer.invoke("salePayment:listBySaleId", saleId),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export type ElectronAPI = typeof electronAPI;
