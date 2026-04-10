import type { PrismaClient } from "@prisma/client";
import { SalePayment } from "../../core/entities";
import type { SalePaymentRepository } from "../../core/repositories";
import { prisma } from "../database/prismaClient";

function toDomain(row: any): SalePayment {
  return SalePayment.create({
    id: row.id,
    saleId: row.sale_id,
    paymentMethodId: row.payment_method_id,
    amount: row.amount,
    tendered: typeof row.tendered === "number" ? row.tendered : null,
    changeDue: typeof row.change_due === "number" ? row.change_due : null,
  });
}

export class PrismaSalePaymentRepository implements SalePaymentRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(payment: SalePayment): Promise<void> {
    const dbAny = this.db as any;
    const value = payment.toJSON();

    await dbAny.sale_payment.upsert({
      where: { id: value.id },
      update: {
        sale_id: value.saleId,
        payment_method_id: value.paymentMethodId,
        amount: value.amount,
        tendered: value.tendered,
        change_due: value.changeDue,
      },
      create: {
        id: value.id,
        sale_id: value.saleId,
        payment_method_id: value.paymentMethodId,
        amount: value.amount,
        tendered: value.tendered,
        change_due: value.changeDue,
      },
    });
  }

  async listBySaleId(saleId: string): Promise<SalePayment[]> {
    const dbAny = this.db as any;
    const rows = await dbAny.sale_payment.findMany({
      where: { sale_id: saleId },
      orderBy: { amount: "desc" as any },
    });

    return rows.map(toDomain);
  }
}
