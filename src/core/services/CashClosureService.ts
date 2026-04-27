import { CashClosure, CashClosurePaymentBreakdown, CashRegister } from "../entities";
import type {
  CashClosurePaymentBreakdownRepository,
  CashClosureRepository,
  CashRegisterRepository,
  PaymentMethodRepository,
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
  summary: CashClosureSummary;
}

export interface CashClosurePaymentSummary {
  paymentMethodId: string;
  paymentMethodName: string;
  isCash: number;
  paymentCount: number;
  totalAmount: number;
}

export interface CashClosureSummary {
  hasSales: boolean;
  noSalesMessage: string | null;
  salesCount: number;
  totalSalesAmount: number;
  grossCashAmount: number;
  changeReturned: number;
  netCashSales: number;
  openingAmount: number;
  totalInDrawer: number;
  paymentSummary: CashClosurePaymentSummary[];
}

function toISOOrNow(value?: string): string {
  if (!value?.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function buildFolio(businessDate: string): string {
  const compactDate = businessDate.replace(/-/g, "");
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CC-${compactDate}-${timestamp}${random}`;
}

export class CashClosureService {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly salePaymentRepository: SalePaymentRepository,
    private readonly cashClosureRepository: CashClosureRepository,
    private readonly breakdownRepository: CashClosurePaymentBreakdownRepository,
    private readonly cashRegisterRepository: CashRegisterRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository,
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
    const closureUserId = input.userId?.trim() || openRegister.openedByUserId;

    const sales = await this.saleRepository.findByDateRange(new Date(openedAtISO), new Date(closedAtISO));
    const salesInRegister = sales.filter((sale) => sale.cashRegisterId === openRegister.id);

    const salesCount = salesInRegister.length;
    const totalAmount = salesInRegister.reduce((sum, sale) => sum + sale.total, 0);

    const paymentMethods = await this.paymentMethodRepository.list();
    const paymentMethodById = new Map(
      paymentMethods.map((method) => [
        method.id,
        { paymentMethodName: method.method, isCash: method.isCash },
      ]),
    );

    const totalsByMethod = new Map<string, number>();
    const paymentsCountByMethod = new Map<string, number>();
    let grossCashAmount = 0;
    let changeReturned = 0;
    let netCashSales = 0;

    for (const sale of salesInRegister) {
      const payments = await this.salePaymentRepository.listBySaleId(sale.id);
      for (const payment of payments) {
        const current = totalsByMethod.get(payment.paymentMethodId) ?? 0;
        totalsByMethod.set(payment.paymentMethodId, current + payment.amount);

        const currentCount = paymentsCountByMethod.get(payment.paymentMethodId) ?? 0;
        paymentsCountByMethod.set(payment.paymentMethodId, currentCount + 1);

        const method = paymentMethodById.get(payment.paymentMethodId);
        const isCashPayment = method?.isCash === 1 || payment.tendered !== null || payment.changeDue !== null;

        if (isCashPayment) {
          grossCashAmount += payment.tendered ?? payment.amount;
          changeReturned += payment.changeDue ?? 0;
          netCashSales += payment.amount;
        }
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
      userId: closureUserId,
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

    const paymentSummary: CashClosurePaymentSummary[] = [...totalsByMethod.entries()]
      .map(([paymentMethodId, total]) => {
        const method = paymentMethodById.get(paymentMethodId);
        return {
          paymentMethodId,
          paymentMethodName: method?.paymentMethodName ?? paymentMethodId,
          isCash: method?.isCash ?? 0,
          paymentCount: paymentsCountByMethod.get(paymentMethodId) ?? 0,
          totalAmount: total,
        };
      })
      .sort((left, right) => right.totalAmount - left.totalAmount);

    const hasSales = salesCount > 0;
    const totalInDrawer = openRegister.openingAmount + grossCashAmount - changeReturned;
    const summary: CashClosureSummary = {
      hasSales,
      noSalesMessage: hasSales ? null : "No se registraron ventas en este corte.",
      salesCount,
      totalSalesAmount: totalAmount,
      grossCashAmount,
      changeReturned,
      netCashSales,
      openingAmount: openRegister.openingAmount,
      totalInDrawer,
      paymentSummary,
    };

    const closedRegister = CashRegister.create({
      id: openRegister.id,
      openingAmount: openRegister.openingAmount,
      openedAt: openRegister.openedAt,
      openedByUserId: openRegister.openedByUserId,
      status: "closed",
    });
    await this.cashRegisterRepository.save(closedRegister);

    return { closure, breakdown, summary };
  }
}
