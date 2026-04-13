import { SalePayment } from "@core/entities"
import type { SalePaymentRepository } from "@core/repositories"

export class ElectronSalePaymentRepository implements SalePaymentRepository {
  async save(payment: SalePayment): Promise<void> {
    await window.electronAPI?.salePaymentSave?.(payment.toJSON())
  }

  async listBySaleId(saleId: string): Promise<SalePayment[]> {
    const rows = await window.electronAPI?.salePaymentListBySaleId?.(saleId)
    if (!rows) return []
    return rows.map((row: any) => SalePayment.create(row))
  }
}
