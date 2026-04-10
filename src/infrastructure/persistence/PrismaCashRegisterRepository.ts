import type { PrismaClient } from "@prisma/client";
import { CashRegister } from "../../core/entities";
import type { CashRegisterRepository } from "../../core/repositories";
import { prisma } from "../database/prismaClient";

function toISOOrNow(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toDomain(row: any): CashRegister {
  return CashRegister.create({
    id: row.id,
    openingAmount: row.opening_amount,
    status: row.status,
    openedAt: toISOOrNow(row.opened_at),
    openedByUserId: row.opened_by_user_id,
  });
}

export class PrismaCashRegisterRepository implements CashRegisterRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(cashRegister: CashRegister): Promise<void> {
    const dbAny = this.db as any;
    const value = cashRegister.toJSON();

    await dbAny.cash_register.upsert({
      where: { id: value.id },
      update: {
        opening_amount: value.openingAmount,
        status: value.status,
        opened_by_user_id: value.openedByUserId,
      },
      create: {
        id: value.id,
        opening_amount: value.openingAmount,
        status: value.status,
        opened_at: toISOOrNow(value.openedAt),
        opened_by_user_id: value.openedByUserId,
      },
    });
  }

  async findById(id: string): Promise<CashRegister | null> {
    const dbAny = this.db as any;
    const row = await dbAny.cash_register.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async list(): Promise<CashRegister[]> {
    const dbAny = this.db as any;
    const rows = await dbAny.cash_register.findMany({ orderBy: { opened_at: "desc" as any } });
    return rows.map(toDomain);
  }

  async findOpen(): Promise<CashRegister | null> {
    const dbAny = this.db as any;
    const row = await dbAny.cash_register.findFirst({
      where: { status: "open" },
      orderBy: { opened_at: "desc" as any },
    });

    return row ? toDomain(row) : null;
  }
}
