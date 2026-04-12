import type { PrismaClient } from "@prisma/client";
import { PaymentMethod } from "../../core/entities";
import type { PaymentMethodRepository } from "../../core/repositories";
import { prisma } from "../database/prismaClient";

function toDomain(row: any): PaymentMethod {
  return PaymentMethod.create({
    id: row.id,
    method: row.method,
    isCash: row.is_cash,
    isActive: row.is_active,
    displayOrder: typeof row.display_order === "number" ? row.display_order : null,
  });
}

export class PrismaPaymentMethodRepository implements PaymentMethodRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(method: PaymentMethod): Promise<void> {
    const dbAny = this.db as any;
    const value = method.toJSON();

    await dbAny.payment_methods.upsert({
      where: { id: value.id },
      update: {
        method: value.method,
        is_cash: value.isCash,
        is_active: value.isActive,
        display_order: value.displayOrder,
      },
      create: {
        id: value.id,
        method: value.method,
        is_cash: value.isCash,
        is_active: value.isActive,
        display_order: value.displayOrder,
      },
    });
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    const dbAny = this.db as any;
    const row = await dbAny.payment_methods.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async list(): Promise<PaymentMethod[]> {
    const dbAny = this.db as any;
    const rows = await dbAny.payment_methods.findMany({ orderBy: { display_order: "asc" as any } });
    return rows.map(toDomain);
  }

  async listActive(): Promise<PaymentMethod[]> {
    const dbAny = this.db as any;
    const rows = await dbAny.payment_methods.findMany({
      where: { is_active: 1 },
      orderBy: [{ display_order: "asc" as any }, { method: "asc" as any }],
    });

    return rows.map(toDomain);
  }
}
