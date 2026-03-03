/**
 * ElectronSaleRepository
 * 
 * Implementa SaleRepository llamando al proceso main de Electron via IPC.
 * Los datos viajan como JSON plano y se reconstruyen como entidades Sale.
 * 
 * Corre en el renderer (React). No importa Prisma.
 */

import { Sale } from "@core/entities"
import type { SaleRepository } from "@core/repositories"

function getAPI(): NonNullable<typeof window.electronAPI> {
  const api = window.electronAPI
  if (!api) throw new Error("electronAPI not available — ¿está corriendo en Electron?")
  return api
}

export class ElectronSaleRepository implements SaleRepository {
  async save(sale: Sale): Promise<void> {
    await getAPI().saleSave(sale.toJSON())
  }

  async findById(id: string): Promise<Sale | null> {
    const json = await getAPI().saleFindById(id)
    if (!json) return null
    return Sale.create({
      id: json.id,
      userId: json.userId,
      createdAt: json.createdAt,
      items: json.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    })
  }

  async list(): Promise<Sale[]> {
    const rows = await getAPI().saleList()
    return rows.map((json: any) =>
      Sale.create({
        id: json.id,
        userId: json.userId,
        createdAt: json.createdAt,
        items: json.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      })
    )
  }
}
