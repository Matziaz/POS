export type CashRegisterId = string;

export interface CashRegisterProps {
  id: CashRegisterId;
  openingAmount: number;
  status: string;
  openedAt: string;
  openedByUserId: string;
}

export class CashRegister {
  private constructor(private readonly props: CashRegisterProps) {}

  static create(
    input: Omit<CashRegisterProps, "openingAmount" | "status" | "openedAt"> & {
      openingAmount?: number;
      status?: string;
      openedAt?: string;
    }
  ): CashRegister {
    const openingAmount = input.openingAmount ?? 0;
    const status = input.status?.trim() || "open";
    const openedAt = input.openedAt ?? new Date().toISOString();

    if (!input.id?.trim()) throw new Error("CashRegister.id is required");
    if (typeof openingAmount !== "number" || !Number.isFinite(openingAmount) || openingAmount < 0) {
      throw new Error("CashRegister.openingAmount must be a non-negative number");
    }
    if (!status) throw new Error("CashRegister.status is required");
    if (!input.openedByUserId?.trim()) throw new Error("CashRegister.openedByUserId is required");

    return new CashRegister({
      id: input.id,
      openingAmount,
      status,
      openedAt,
      openedByUserId: input.openedByUserId,
    });
  }

  get id() { return this.props.id; }
  get openingAmount() { return this.props.openingAmount; }
  get status() { return this.props.status; }
  get openedAt() { return this.props.openedAt; }
  get openedByUserId() { return this.props.openedByUserId; }

  toJSON(): CashRegisterProps {
    return { ...this.props };
  }
}
