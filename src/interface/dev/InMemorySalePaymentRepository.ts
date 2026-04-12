import { SalePayment } from "@core/entities"
import type { SalePaymentRepository } from "@core/repositories"

export class InMemorySalePaymentRepository implements SalePaymentRepository {
  private payments = new Map<string, SalePayment>()

  async save(payment: SalePayment): Promise<void> {
    this.payments.set(payment.id, payment)
  }

  async listBySaleId(saleId: string): Promise<SalePayment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.saleId === saleId
    )
  }
}