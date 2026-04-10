import type { PrismaClient } from "@prisma/client";
import { CashClosurePaymentBreakdown } from "../../core/entities";
import type { CashClosurePaymentBreakdownRepository } from "../../core/repositories";
import { prisma } from "../database/prismaClient";

function toDomain(row: any): CashClosurePaymentBreakdown {
  return CashClosurePaymentBreakdown.create({
    id: row.id,
    cashClosureId: row.cash_closure_id,
    paymentMethodId: row.payment_method_id,
    totalAmount: row.total_amount,
  });
}

export class PrismaCashClosurePaymentBreakdownRepository implements CashClosurePaymentBreakdownRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(breakdown: CashClosurePaymentBreakdown): Promise<void> {
    const dbAny = this.db as any;
    const value = breakdown.toJSON();

    await dbAny.cash_closure_payment_breakdown.upsert({
      where: { id: value.id },
      update: {
        cash_closure_id: value.cashClosureId,
        payment_method_id: value.paymentMethodId,
        total_amount: value.totalAmount,
      },
      create: {
        id: value.id,
        cash_closure_id: value.cashClosureId,
        payment_method_id: value.paymentMethodId,
        total_amount: value.totalAmount,
      },
    });
  }

  async listByCashClosureId(cashClosureId: string): Promise<CashClosurePaymentBreakdown[]> {
    const dbAny = this.db as any;
    const rows = await dbAny.cash_closure_payment_breakdown.findMany({
      where: { cash_closure_id: cashClosureId },
      orderBy: { total_amount: "desc" as any },
    });

    return rows.map(toDomain);
  }
}
