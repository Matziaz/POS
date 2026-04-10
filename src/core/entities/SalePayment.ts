export type SalePaymentId = string;

export interface SalePaymentProps {
  id: SalePaymentId;
  saleId: string;
  paymentMethodId: string;
  amount: number;
  tendered: number | null;
  changeDue: number | null;
}

export class SalePayment {
  private constructor(private readonly props: SalePaymentProps) {}

  static create(
    input: Omit<SalePaymentProps, "tendered" | "changeDue"> & {
      tendered?: number | null;
      changeDue?: number | null;
    }
  ): SalePayment {
    const tendered = typeof input.tendered === "number" ? input.tendered : null;
    const changeDue = typeof input.changeDue === "number" ? input.changeDue : null;

    if (!input.id?.trim()) throw new Error("SalePayment.id is required");
    if (!input.saleId?.trim()) throw new Error("SalePayment.saleId is required");
    if (!input.paymentMethodId?.trim()) throw new Error("SalePayment.paymentMethodId is required");
    if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount < 0) {
      throw new Error("SalePayment.amount must be a non-negative number");
    }

    return new SalePayment({
      id: input.id,
      saleId: input.saleId,
      paymentMethodId: input.paymentMethodId,
      amount: input.amount,
      tendered,
      changeDue,
    });
  }

  get id() { return this.props.id; }
  get saleId() { return this.props.saleId; }
  get paymentMethodId() { return this.props.paymentMethodId; }
  get amount() { return this.props.amount; }
  get tendered() { return this.props.tendered; }
  get changeDue() { return this.props.changeDue; }

  toJSON(): SalePaymentProps {
    return { ...this.props };
  }
}
