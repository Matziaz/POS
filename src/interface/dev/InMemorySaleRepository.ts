/**
 * InMemorySaleRepository
 * 
 * Implementación temporal en memoria de SaleRepository para desarrollo de UI.
 * TODO: Reemplazar con implementación real de infrastructure/ cuando esté lista.
 */

import { Sale } from "@core/entities"
import type { SaleRepository } from "@core/repositories"
import { newId } from "@core/services/id"
import { DEFAULT_USER_ID } from "@core/constants"

export class InMemorySaleRepository implements SaleRepository {
  private sales = new Map<string, Sale>()

  constructor() {
    this.seed()
  }

  private seed(): void {
    // Ventas de ejemplo que simulan datos reales del seed de Prisma
    const sampleSales = [
      Sale.create({
        id: "sale_001",
        userId: DEFAULT_USER_ID,
        items: [
          { id: newId(), productId: "p1", quantity: 5, price: 15.50 },
          { id: newId(), productId: "p3", quantity: 2, price: 32.25 },
        ],
        createdAt: "2026-02-20T09:30:00.000Z",
      }),
      Sale.create({
        id: "sale_002",
        userId: DEFAULT_USER_ID,
        items: [
          { id: newId(), productId: "p2", quantity: 2, price: 8.00 },
          { id: newId(), productId: "p1", quantity: 1, price: 15.50 },
        ],
        createdAt: "2026-02-21T14:15:00.000Z",
      }),
      Sale.create({
        id: "sale_003",
        userId: DEFAULT_USER_ID,
        items: [
          { id: newId(), productId: "p3", quantity: 1, price: 32.25 },
        ],
        createdAt: "2026-02-22T11:00:00.000Z",
      }),
    ]

    for (const sale of sampleSales) {
      this.sales.set(sale.id, sale)
    }
  }

  async save(sale: Sale): Promise<void> {
    this.sales.set(sale.id, sale)
  }

  async findById(id: string): Promise<Sale | null> {
    return this.sales.get(id) ?? null
  }

  async list(): Promise<Sale[]> {
    return Array.from(this.sales.values())
  }
}
