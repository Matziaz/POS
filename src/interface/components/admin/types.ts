export type AdminSection = "setup" | "restore" | "payment" | "config"

export interface AdminProductType {
  id: string
  name: string
}

export interface AdminDeletedProductType extends AdminProductType {
  deletedAt: string | null
}

export interface AdminUser {
  id: string
  username: string
  roleType: string
  createdAt: string
}

export interface AdminRole {
  id: string
  type: string
}

export interface AdminPaymentMethod {
  id: string
  method: string
  isCash: number
  isActive: number
  displayOrder: number | null
}
