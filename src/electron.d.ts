/**
 * Type declarations for the Electron IPC bridge.
 * Makes window.electronAPI available in TypeScript without (window as any) hacks.
 */

interface ProductJSON {
  id: string
  sku: string
  name: string
  typeId: string
  price: number
  stock: number
  providerId: string
  image: string
  createdAt: string
}

interface ProductTypeJSON {
  id: string
  name: string
}

interface ProviderJSON {
  id: string
  name: string
  telephone: string | null
  email: string | null
  productCount: number
}

interface ProviderCreateJSON {
  id?: string
  name: string
  telephone?: string | null
  email?: string | null
  image?: string
}

interface UserJSON {
  id: string
  username: string
  roleType: string
  createdAt: string
}

interface UserCreateJSON {
  id?: string
  username: string
  password: string
  roleType: "ADMIN" | "CASHIER"
}

interface SaleItemJSON {
  id: string
  saleId: string
  productId: string
  quantity: number
  price: number
}

interface SaleJSON {
  id: string
  userId: string
  total: number
  createdAt: string
  items: SaleItemJSON[]
}

interface InventoryMovementJSON {
  id: string
  productId: string
  type: "IN" | "OUT"
  quantity: number
  createdAt: string
}

interface ElectronAPI {
  // Products
  productList(): Promise<ProductJSON[]>
  productFindById(id: string): Promise<ProductJSON | null>
  productFindBySku(sku: string): Promise<ProductJSON | null>
  productSave(data: ProductJSON): Promise<void>
  productDelete(id: string): Promise<void>
  productTypeList(): Promise<ProductTypeJSON[]>
  providerList(): Promise<ProviderJSON[]>
  providerSave(data: ProviderCreateJSON): Promise<void>
  userList(): Promise<UserJSON[]>
  userSave(data: UserCreateJSON): Promise<void>
  
  // Sales
  saleList(): Promise<SaleJSON[]>
  saleListByDateRange(fromISO: string, toISO: string): Promise<SaleJSON[]>
  saleSumByDateRange(fromISO: string, toISO: string): Promise<number>
  saleCountByDateRange(fromISO: string, toISO: string): Promise<number>
  saleFindById(id: string): Promise<SaleJSON | null>
  saleSave(data: SaleJSON): Promise<void>

  // Inventory Movements
  inventoryMovementSave(data: InventoryMovementJSON): Promise<void>
  inventoryMovementListByProduct(productId: string): Promise<InventoryMovementJSON[]>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
