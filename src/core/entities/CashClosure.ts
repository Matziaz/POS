export type CashClosureId = string;

export interface CashClosureProps {
  id: CashClosureId;
  folio: string;
  businessDate: string;
  openedAt: string;
  closedAt: string;
  salesCount: number;
  totalAmount: number;
  isFinal: number;
  userId: string | null;
  notes: string | null;
  createdAt: string;
}

export class CashClosure {
  private constructor(private readonly props: CashClosureProps) {}

  static create(
    input: Omit<CashClosureProps, "isFinal" | "userId" | "notes" | "createdAt"> & {
      isFinal?: number;
      userId?: string | null;
      notes?: string | null;
      createdAt?: string;
    }
  ): CashClosure {
    const isFinal = input.isFinal ?? 1;
    const userId = input.userId?.trim() || null;
    const notes = input.notes?.trim() || null;
    const createdAt = input.createdAt ?? new Date().toISOString();

    if (!input.id?.trim()) throw new Error("CashClosure.id is required");
    if (!input.folio?.trim()) throw new Error("CashClosure.folio is required");
    if (!input.businessDate?.trim()) throw new Error("CashClosure.businessDate is required");
    if (!input.openedAt?.trim()) throw new Error("CashClosure.openedAt is required");
    if (!input.closedAt?.trim()) throw new Error("CashClosure.closedAt is required");
    if (!Number.isInteger(input.salesCount) || input.salesCount < 0) {
      throw new Error("CashClosure.salesCount must be a non-negative integer");
    }
    if (typeof input.totalAmount !== "number" || !Number.isFinite(input.totalAmount) || input.totalAmount < 0) {
      throw new Error("CashClosure.totalAmount must be a non-negative number");
    }
    if (![0, 1].includes(isFinal)) throw new Error("CashClosure.isFinal must be 0 or 1");

    return new CashClosure({
      id: input.id,
      folio: input.folio,
      businessDate: input.businessDate,
      openedAt: input.openedAt,
      closedAt: input.closedAt,
      salesCount: input.salesCount,
      totalAmount: input.totalAmount,
      isFinal,
      userId,
      notes,
      createdAt,
    });
  }

  get id() { return this.props.id; }
  get folio() { return this.props.folio; }
  get businessDate() { return this.props.businessDate; }
  get openedAt() { return this.props.openedAt; }
  get closedAt() { return this.props.closedAt; }
  get salesCount() { return this.props.salesCount; }
  get totalAmount() { return this.props.totalAmount; }
  get isFinal() { return this.props.isFinal; }
  get userId() { return this.props.userId; }
  get notes() { return this.props.notes; }
  get createdAt() { return this.props.createdAt; }

  toJSON(): CashClosureProps {
    return { ...this.props };
  }
}
