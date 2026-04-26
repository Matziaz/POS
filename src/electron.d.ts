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
  deletedAt: string | null
}

interface ProductListSortOptionsJSON {
  sortBy?: "createdAt" | "name" | "sku" | "price" | "stock" | "typeId"
  sortDirection?: "asc" | "desc"
}

interface ProductTypeJSON {
  id: string
  name: string
  deletedAt?: string | null
}

interface ProductTypeCreateJSON {
  name: string;
}

interface ProductTypeUpdateJSON {
  id: string;
  name: string;
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

interface ProviderUpdateJSON {
  id: string
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

interface UserUpdateJSON {
  id: string
  username: string
  password?: string
  roleType: "ADMIN" | "CASHIER"
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
  id: string
  saleId: string
  productId: string
  quantity: number
  price: number
}

interface SaleJSON {
  id: string
  userId: string
  cashRegisterId?: string | null
  total: number
  createdAt: string
  items: SaleItemJSON[]
}

interface SaleListFiltersJSON {
  fromISO?: string
  toISO?: string
}

interface InventoryMovementJSON {
  id: string
  productId: string
  type: "IN" | "OUT"
  quantity: number
  createdAt: string
}

interface ConfigurationJSON {
  id: string
  retailContext: string
  isActive: string | number | null
}

interface ConfigurationCreateJSON {
  retailContext: string
}

interface CashRegisterJSON {
  id: string
  openingAmount: number
  status: string
  openedAt: string
  openedByUserId: string
}

interface CashRegisterCreateJSON {
  openingAmount: number
  openedByUserId?: string
}

interface SalePaymentJSON {
  id: string
  saleId: string
  paymentMethodId: string
  amount: number
  tendered: number | null
  changeDue: number | null
}

interface CashClosureJSON {
  id: string
  folio: string
  businessDate: string
  openedAt: string
  closedAt: string
  salesCount: number
  totalAmount: number
  isFinal: number
  userId: string | null
  notes: string | null
  createdAt: string
}

interface CashClosurePaymentBreakdownJSON {
  id: string
  cashClosureId: string
  paymentMethodId: string
  totalAmount: number
}

interface CashClosureCloseJSON {
  closedAt?: string
  businessDate?: string
  userId?: string
  notes?: string
  isFinal?: boolean
}

interface CashClosureCloseResultJSON {
  closure: CashClosureJSON
  breakdown: CashClosurePaymentBreakdownJSON[]
}

interface CashClosureReminderConfigJSON {
  reminderTime: string
  closureTime: string
}

interface CashClosurePreCloseReminderJSON {
  businessDate: string
  triggeredAt: string
  scheduledTime: string
}


interface CashClosurePrecloseAlertJSON {
  businessDate: string
  triggeredAt: string
  message: string
}

interface PaymentMethodJSON {
  id: string
  method: string
  isCash: number
  isActive: number
  displayOrder: number | null
}

interface PaymentMethodCreateJSON {
  method: string
  isCash: number
  displayOrder?: number | null
}

interface PaymentMethodUpdateJSON {
  id: string
  method: string
  displayOrder?: number | null
}

interface ElectronAPI {
  // Products
  productList(): Promise<ProductJSON[]>
  productListPaginated(page: number, pageSize: number, options?: ProductListSortOptionsJSON): Promise<{ products: ProductJSON[]; total: number }>
  productFindById(id: string): Promise<ProductJSON | null>
  productFindBySku(sku: string): Promise<ProductJSON | null>
  productListDeleted(): Promise<ProductJSON[]>
  productSave(data: ProductJSON): Promise<void>
  productDelete(id: string): Promise<void>
  productRestore(id: string, stock: number): Promise<void>
  productTypeList(): Promise<ProductTypeJSON[]>
  productTypeListDeleted(): Promise<ProductTypeJSON[]>
  productTypeCreate(data: ProductTypeCreateJSON): Promise<void>;
  productTypeUpdate(data: ProductTypeUpdateJSON): Promise<void>;
  productTypeDelete(id: string): Promise<void>;
  productTypeRestore(id: string): Promise<void>;
  roleList(): Promise<RoleJSON[]>;
  roleCreate(data: RoleCreateJSON): Promise<void>;
  roleUpdate(data: RoleUpdateJSON): Promise<void>;
  roleDelete(id: string): Promise<void>;
  providerList(): Promise<ProviderJSON[]>
  providerSave(data: ProviderCreateJSON): Promise<void>
  providerUpdate(data: ProviderUpdateJSON): Promise<void>
  providerDelete(id: string): Promise<void>
  userList(): Promise<UserJSON[]>
  userSave(data: UserCreateJSON): Promise<void>
  userUpdate(data: UserUpdateJSON): Promise<void>
  userDelete(id: string): Promise<void>
  
  // Sales
  saleList(): Promise<SaleJSON[]>
  saleListByDateRange(fromISO: string, toISO: string): Promise<SaleJSON[]>
  saleSumByDateRange(fromISO: string, toISO: string): Promise<number>
  saleCountByDateRange(fromISO: string, toISO: string): Promise<number>
  saleFindById(id: string): Promise<SaleJSON | null>
  saleSave(data: SaleJSON): Promise<void>
  saleListPaginated(page: number, pageSize: number, filters?: SaleListFiltersJSON): Promise<{ sales: SaleJSON[]; total: number }>
  
  // Payment Methods
  paymentMethodListActive(): Promise<any[]>
  paymentMethodList(): Promise<PaymentMethodJSON[]>
  paymentMethodCreate(data: PaymentMethodCreateJSON): Promise<PaymentMethodJSON>
  paymentMethodUpdate(data: PaymentMethodUpdateJSON): Promise<void>
  paymentMethodToggleActive(id: string): Promise<PaymentMethodJSON>
  
  // Cash Closure
  cashClosureClose(data: CashClosureCloseJSON): Promise<CashClosureCloseResultJSON>
  cashClosureListByDateRange(fromISO: string, toISO: string): Promise<CashClosureJSON[]>
  onCashClosurePreCloseReminder(callback: (payload: CashClosurePreCloseReminderJSON) => void): () => void

  // Sale Payments
  salePaymentSave(data: SalePaymentJSON): Promise<void>
  salePaymentListBySaleId(saleId: string): Promise<SalePaymentJSON[]>

  // Inventory Movements
  inventoryMovementSave(data: InventoryMovementJSON): Promise<void>
  inventoryMovementListByProduct(productId: string): Promise<InventoryMovementJSON[]>

  // App Configuration
  configurationListContexts(): Promise<string[]>
  configurationGet(): Promise<ConfigurationJSON | null>
  configurationIsSetupComplete(): Promise<boolean>
  configurationSaveInitial(data: ConfigurationCreateJSON): Promise<ConfigurationJSON>
  cashClosureReminderConfigGet(): Promise<CashClosureReminderConfigJSON>
  cashClosureReminderConfigSave(data: CashClosureReminderConfigJSON): Promise<CashClosureReminderConfigJSON>
  cashClosureGetPendingReminder(): Promise<CashClosurePreCloseReminderJSON | null>

  // Cash Register
  cashRegisterGetOpen(): Promise<CashRegisterJSON | null>
  cashRegisterOpen(data: CashRegisterCreateJSON): Promise<CashRegisterJSON>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
