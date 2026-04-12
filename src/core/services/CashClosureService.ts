import { CashClosure, CashClosurePaymentBreakdown, CashRegister } from "../entities";
import type {
  CashClosurePaymentBreakdownRepository,
  CashClosureRepository,
  CashRegisterRepository,
  SalePaymentRepository,
  SaleRepository,
} from "../repositories";
import { ValidationError } from "../errors";
import { newId } from "./id";

export interface CloseCashClosureInput {
  closedAt?: string;
  businessDate?: string;
  userId?: string;
  notes?: string;
  isFinal?: boolean;
}

export interface CloseCashClosureResult {
  closure: CashClosure;
  breakdown: CashClosurePaymentBreakdown[];
}

function toISOOrNow(value?: string): string {
  if (!value?.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function buildFolio(businessDate: string): string {
  const compactDate = businessDate.replace(/-/g, "");
  return `CC-${compactDate}-${newId().slice(0, 8).toUpperCase()}`;
}

export class CashClosureService {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly salePaymentRepository: SalePaymentRepository,
    private readonly cashClosureRepository: CashClosureRepository,
    private readonly breakdownRepository: CashClosurePaymentBreakdownRepository,
    private readonly cashRegisterRepository: CashRegisterRepository,
  ) {}

  async closeDaily(input: CloseCashClosureInput = {}): Promise<CloseCashClosureResult> {
    const openRegister = await this.cashRegisterRepository.findOpen();
    if (!openRegister) {
      throw new ValidationError("No hay una caja abierta para cerrar");
    }

    const openedAtISO = toISOOrNow(openRegister.openedAt);
    const closedAtISO = toISOOrNow(input.closedAt);

    if (new Date(closedAtISO).getTime() <= new Date(openedAtISO).getTime()) {
      throw new ValidationError("La fecha de cierre debe ser posterior a la apertura");
    }

    const businessDate = (input.businessDate?.trim() || closedAtISO.slice(0, 10));
    const folio = buildFolio(businessDate);

    const sales = await this.saleRepository.findByDateRange(new Date(openedAtISO), new Date(closedAtISO));
    const salesInRegister = sales.filter((sale) => sale.cashRegisterId === openRegister.id);

    const salesCount = salesInRegister.length;
    const totalAmount = salesInRegister.reduce((sum, sale) => sum + sale.total, 0);

    const totalsByMethod = new Map<string, number>();

    for (const sale of salesInRegister) {
      const payments = await this.salePaymentRepository.listBySaleId(sale.id);
      for (const payment of payments) {
        const current = totalsByMethod.get(payment.paymentMethodId) ?? 0;
        totalsByMethod.set(payment.paymentMethodId, current + payment.amount);
      }
    }

    const closure = CashClosure.create({
      id: newId(),
      folio,
      businessDate,
      openedAt: openedAtISO,
      closedAt: closedAtISO,
      salesCount,
      totalAmount,
      userId: input.userId?.trim() || null,
      notes: input.notes?.trim() || null,
      isFinal: input.isFinal === false ? 0 : 1,
    });

    await this.cashClosureRepository.save(closure);

    const breakdown: CashClosurePaymentBreakdown[] = [];
    for (const [paymentMethodId, total] of totalsByMethod.entries()) {
      const row = CashClosurePaymentBreakdown.create({
        id: newId(),
        cashClosureId: closure.id,
        paymentMethodId,
        totalAmount: total,
      });
      breakdown.push(row);
      await this.breakdownRepository.save(row);
    }

    const closedRegister = CashRegister.create({
      id: openRegister.id,
      openingAmount: openRegister.openingAmount,
      openedAt: openRegister.openedAt,
      openedByUserId: openRegister.openedByUserId,
      status: "closed",
    });
    await this.cashRegisterRepository.save(closedRegister);

    return { closure, breakdown };
  }
}
