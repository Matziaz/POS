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

  // Sales
  saleList: (): Promise<SaleJSON[]> =>
    ipcRenderer.invoke("sale:list"),
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
