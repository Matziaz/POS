export type CashClosurePaymentBreakdownId = string;

export interface CashClosurePaymentBreakdownProps {
  id: CashClosurePaymentBreakdownId;
  cashClosureId: string;
  paymentMethodId: string;
  totalAmount: number;
}

export class CashClosurePaymentBreakdown {
  private constructor(private readonly props: CashClosurePaymentBreakdownProps) {}

  static create(input: CashClosurePaymentBreakdownProps): CashClosurePaymentBreakdown {
    if (!input.id?.trim()) throw new Error("CashClosurePaymentBreakdown.id is required");
    if (!input.cashClosureId?.trim()) throw new Error("CashClosurePaymentBreakdown.cashClosureId is required");
    if (!input.paymentMethodId?.trim()) throw new Error("CashClosurePaymentBreakdown.paymentMethodId is required");
    if (typeof input.totalAmount !== "number" || !Number.isFinite(input.totalAmount) || input.totalAmount < 0) {
      throw new Error("CashClosurePaymentBreakdown.totalAmount must be a non-negative number");
    }

    return new CashClosurePaymentBreakdown({ ...input });
  }

  get id() { return this.props.id; }
  get cashClosureId() { return this.props.cashClosureId; }
  get paymentMethodId() { return this.props.paymentMethodId; }
  get totalAmount() { return this.props.totalAmount; }

  toJSON(): CashClosurePaymentBreakdownProps {
    return { ...this.props };
  }
}
