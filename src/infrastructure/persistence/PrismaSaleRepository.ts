/**
 * PrismaSaleRepository
 * 
 * Implementación de SaleRepository usando Prisma ORM.
 * Corre en el proceso main de Electron (Node.js).
 */

import type { SaleRepository } from "../../core/repositories/SaleRepository";
import { Sale } from "../../core/entities/Sale";
import { prisma } from "../database/prismaClient";

export class PrismaSaleRepository implements SaleRepository {
  async save(sale: Sale): Promise<void> {
    const data = sale.toJSON();

    await prisma.sale.create({
      data: {
        id: data.id,
        user_id: data.userId,
        total: data.total,
        created_at: data.createdAt
          ? new Date(data.createdAt).toISOString()
          : new Date().toISOString(),
        sale_item: {
          create: data.items.map((item) => ({
            id: item.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }

  async findById(id: string): Promise<Sale | null> {
    const row = await prisma.sale.findUnique({
      where: { id },
      include: { sale_item: true },
    });
    if (!row) return null;

    return Sale.create({
      id: row.id,
      userId: row.user_id,
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date().toISOString(),
      items: row.sale_item.map((si) => ({
        id: si.id,
        productId: si.product_id,
        quantity: si.quantity,
        price: si.price,
      })),
    });
  }

  async list(): Promise<Sale[]> {
    const rows = await prisma.sale.findMany({
      include: { sale_item: true },
      orderBy: { created_at: "desc" as any },
    });

    return rows.map((row) =>
      Sale.create({
        id: row.id,
        userId: row.user_id,
        createdAt: row.created_at
          ? new Date(row.created_at).toISOString()
          : new Date().toISOString(),
        items: row.sale_item.map((si) => ({
          id: si.id,
          productId: si.product_id,
          quantity: si.quantity,
          price: si.price,
        })),
      })
    );
  }
}
