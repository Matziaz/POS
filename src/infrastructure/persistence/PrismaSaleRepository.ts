/**
 * PrismaSaleRepository
 * 
 * Implementación de SaleRepository usando Prisma ORM.
 * Corre en el proceso main de Electron (Node.js).
 */

import type { SaleRepository } from "../../core/repositories/SaleRepository";
import { Sale } from "../../core/entities/Sale";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../database/prismaClient";

function toISOOrNow(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export class PrismaSaleRepository implements SaleRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  private async resolveCashRegisterId(preferredId: string | null): Promise<string> {
    const dbAny = this.db as any;

    if (preferredId) {
      const register = await dbAny.cash_register.findUnique({ where: { id: preferredId } });
      if (register) return register.id;
    }

    const openRegister = await dbAny.cash_register.findFirst({
      where: { status: "open" },
      orderBy: { opened_at: "desc" as any },
    });
    if (openRegister) return openRegister.id;

    const anyRegister = await dbAny.cash_register.findFirst({
      orderBy: { opened_at: "desc" as any },
    });
    if (anyRegister) return anyRegister.id;

    throw new Error("No cash register found. Create an open cash register before saving sales.");
  }

  private normalizeRange(from: Date, to: Date): { fromISO: string; toISO: string } {
    const fromISO = from.toISOString();
    const toISO = to.toISOString();

    if (new Date(fromISO).getTime() >= new Date(toISO).getTime()) {
      throw new Error("Invalid date range: 'from' must be before 'to'");
    }

    return { fromISO, toISO };
  }

  async save(sale: Sale): Promise<void> {
    const data = sale.toJSON();
    const cashRegisterId = await this.resolveCashRegisterId(data.cashRegisterId ?? null);

    await this.db.sale.create({
      data: {
        id: data.id,
        user_id: data.userId,
        cash_register_id: cashRegisterId,
        total: data.total,
        created_at: toISOOrNow(data.createdAt),
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
    const row = await this.db.sale.findUnique({
      where: { id },
      include: { sale_item: true },
    });
    if (!row) return null;

    return Sale.create({
      id: row.id,
      userId: row.user_id,
      cashRegisterId: (row as any).cash_register_id,
      createdAt: toISOOrNow(row.created_at),
      items: row.sale_item.map((si) => ({
        id: si.id,
        productId: si.product_id,
        quantity: si.quantity,
        price: si.price,
      })),
    });
  }

  async list(): Promise<Sale[]> {
    const rows = await this.db.sale.findMany({
      include: { sale_item: true },
      orderBy: { created_at: "desc" as any },
    });

    return rows.map((row) =>
      Sale.create({
        id: row.id,
        userId: row.user_id,
        cashRegisterId: (row as any).cash_register_id,
        createdAt: toISOOrNow(row.created_at),
        items: row.sale_item.map((si) => ({
          id: si.id,
          productId: si.product_id,
          quantity: si.quantity,
          price: si.price,
        })),
      })
    );
  }

  async findByDateRange(from: Date, to: Date): Promise<Sale[]> {
    const { fromISO, toISO } = this.normalizeRange(from, to);

    const rows = await this.db.sale.findMany({
      where: {
        created_at: {
          gte: fromISO,
          lt: toISO,
        },
      },
      include: { sale_item: true },
      orderBy: { created_at: "desc" as any },
    });

    return rows.map((row) =>
      Sale.create({
        id: row.id,
        userId: row.user_id,
        cashRegisterId: (row as any).cash_register_id,
        createdAt: toISOOrNow(row.created_at),
        items: row.sale_item.map((si) => ({
          id: si.id,
          productId: si.product_id,
          quantity: si.quantity,
          price: si.price,
        })),
      })
    );
  }

  async sumTotalByDateRange(from: Date, to: Date): Promise<number> {
    const sales = await this.findByDateRange(from, to);
    return sales.reduce((sum, sale) => sum + sale.total, 0);
  }

  async countByDateRange(from: Date, to: Date): Promise<number> {
    const sales = await this.findByDateRange(from, to);
    return sales.length;
  }
}
