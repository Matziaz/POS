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
}

interface ProductTypeJSON {
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

// ─── API expuesta al renderer como window.electronAPI ─────────────────────────

const electronAPI = {
  // Products
  productList: (): Promise<ProductJSON[]> =>
    ipcRenderer.invoke("product:list"),
  productFindById: (id: string): Promise<ProductJSON | null> =>
    ipcRenderer.invoke("product:findById", id),
  productFindBySku: (sku: string): Promise<ProductJSON | null> =>
    ipcRenderer.invoke("product:findBySku", sku),
  productSave: (data: ProductJSON): Promise<void> =>
    ipcRenderer.invoke("product:save", data),
  productDelete: (id: string): Promise<void> =>
    ipcRenderer.invoke("product:delete", id),
  productTypeList: (): Promise<ProductTypeJSON[]> =>
    ipcRenderer.invoke("productType:list"),
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

  // Inventory Movements
  inventoryMovementSave: (data: InventoryMovementJSON): Promise<void> =>
    ipcRenderer.invoke("inventoryMovement:save", data),
  inventoryMovementListByProduct: (productId: string): Promise<InventoryMovementJSON[]> =>
    ipcRenderer.invoke("inventoryMovement:listByProduct", productId),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export type ElectronAPI = typeof electronAPI;
