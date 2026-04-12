import type { PrismaClient } from "@prisma/client";
import { CashClosure } from "../../core/entities";
import type { CashClosureRepository } from "../../core/repositories";
import { prisma } from "../database/prismaClient";

function toISOOrNow(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toDomain(row: any): CashClosure {
  return CashClosure.create({
    id: row.id,
    folio: row.folio,
    businessDate: row.business_date,
    openedAt: toISOOrNow(row.opened_at),
    closedAt: toISOOrNow(row.closed_at),
    salesCount: row.sales_count,
    totalAmount: row.total_amount,
    isFinal: row.is_final,
    userId: row.user_id,
    notes: row.notes,
    createdAt: toISOOrNow(row.created_at),
  });
}

export class PrismaCashClosureRepository implements CashClosureRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(cashClosure: CashClosure): Promise<void> {
    const dbAny = this.db as any;
    const value = cashClosure.toJSON();

    await dbAny.cash_closure.upsert({
      where: { id: value.id },
      update: {
        folio: value.folio,
        business_date: value.businessDate,
        opened_at: toISOOrNow(value.openedAt),
        closed_at: toISOOrNow(value.closedAt),
        sales_count: value.salesCount,
        total_amount: value.totalAmount,
        is_final: value.isFinal,
        user_id: value.userId,
        notes: value.notes,
      },
      create: {
        id: value.id,
        folio: value.folio,
        business_date: value.businessDate,
        opened_at: toISOOrNow(value.openedAt),
        closed_at: toISOOrNow(value.closedAt),
        sales_count: value.salesCount,
        total_amount: value.totalAmount,
        is_final: value.isFinal,
        user_id: value.userId,
        notes: value.notes,
        created_at: toISOOrNow(value.createdAt),
      },
    });
  }

  async findById(id: string): Promise<CashClosure | null> {
    const dbAny = this.db as any;
    const row = await dbAny.cash_closure.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async listByBusinessDateRange(fromISO: string, toISO: string): Promise<CashClosure[]> {
    const dbAny = this.db as any;
    const rows = await dbAny.cash_closure.findMany({
      where: {
        business_date: {
          gte: fromISO,
          lt: toISO,
        },
      },
      orderBy: { business_date: "desc" as any },
    });

    return rows.map(toDomain);
  }
}
