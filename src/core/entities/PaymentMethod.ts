export type PaymentMethodId = string;

export interface PaymentMethodProps {
  id: PaymentMethodId;
  method: string;
  isCash: number;
  isActive: number;
  displayOrder: number | null;
}

export class PaymentMethod {
  private constructor(private readonly props: PaymentMethodProps) {}

  static create(
    input: Omit<PaymentMethodProps, "isCash" | "isActive" | "displayOrder"> & {
      isCash?: number;
      isActive?: number;
      displayOrder?: number | null;
    }
  ): PaymentMethod {
    const isCash = input.isCash ?? 0;
    const isActive = input.isActive ?? 1;
    const displayOrder = typeof input.displayOrder === "number" ? input.displayOrder : null;

    if (!input.id?.trim()) throw new Error("PaymentMethod.id is required");
    if (!input.method?.trim()) throw new Error("PaymentMethod.method is required");
    if (![0, 1].includes(isCash)) throw new Error("PaymentMethod.isCash must be 0 or 1");
    if (![0, 1].includes(isActive)) throw new Error("PaymentMethod.isActive must be 0 or 1");

    return new PaymentMethod({
      id: input.id,
      method: input.method.trim(),
      isCash,
      isActive,
      displayOrder,
    });
  }

  get id() { return this.props.id; }
  get method() { return this.props.method; }
  get isCash() { return this.props.isCash; }
  get isActive() { return this.props.isActive; }
  get displayOrder() { return this.props.displayOrder; }

  toJSON(): PaymentMethodProps {
    return { ...this.props };
  }
}
