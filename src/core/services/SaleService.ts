import { Sale, InventoryMovement, SalePayment } from "../entities";
import { NotFoundError, ValidationError } from "../errors";
import type { ProductRepository, SaleRepository,SalePaymentRepository} from "../repositories";
import type { InventoryMovementRepository } from "../repositories/InventoryMovementRepository";
import { newId } from "./id";
import { DEFAULT_USER_ID } from "../../shared/constants/constants";
import type { PosContext } from "../../domain/contextos";
import { defaultContext } from "../../domain/contextos";

export class SaleService {
  constructor(
    private readonly products: ProductRepository,
    private readonly sales: SaleRepository,
    private readonly movements: InventoryMovementRepository,
    private readonly salePayments: SalePaymentRepository = {
      save: async () => undefined,
      listBySaleId: async () => [],
    },
    private readonly getContext: () => PosContext = () => defaultContext
  ) {}

  async registerSale(input: {
    userId?: string;
    cashRegisterId?: string;
    lines: { productSku: string; qty: number }[];
    payments : {
      paymentMethodId: string;
      amount: number;
      tendered?: number ;
      changeDue?: number ;
    }[];
  }): Promise<Sale> {
    const context = this.getContext();
    const userId = input.userId?.trim() || context.defaultUserId || DEFAULT_USER_ID;
    const cashRegisterId = input.cashRegisterId?.trim() || undefined;
    const lines = input.lines;
    const payments = input.payments;

    if(!lines.length) throw new ValidationError("Sale must have at least one line");
    if (!payments.length) throw new ValidationError("Sale must have at least one payment");

    const saleId = newId();

    const items = [];
    for (const line of lines) {
      const normalizedSku = context.sku.normalize(line.productSku ?? "");
      context.sku.validate(normalizedSku);

      const p = await this.products.findBySku(normalizedSku);
      if (!p) throw new NotFoundError(`Product with SKU ${normalizedSku} not found`);
      if (!Number.isInteger(line.qty) || line.qty <= 0) throw new ValidationError("Line quantity must be a positive integer");
      if (p.stock < line.qty) throw new ValidationError(`Not enough stock for product ${p.name}`);

      //snapshot del precio al momento de la venta
      items.push({
        id: newId(),
        productId: p.id,
        quantity: line.qty,
        price: p.price,
      });
      //actualizar stock
      await this.products.update(p.withStock(p.stock - line.qty));
      //movimiento de inventario OUT
      const mv = InventoryMovement.create({
        id: newId(),
        productId: p.id,
        type: "OUT",
        quantity: line.qty,
      });
      await this.movements.save(mv);
    }

    const sale = Sale.create({ id: saleId, userId, cashRegisterId, items });

    const paymentsTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (Math.abs(paymentsTotal - sale.total) > 0.0001) {
      throw new ValidationError("Payments total must match sale total");
    }

    for (const payment of payments) {
      if (!payment.paymentMethodId?.trim()) {
        throw new ValidationError("Payment method is required");
      }
      if (typeof payment.amount !== "number" || !Number.isFinite(payment.amount) || payment.amount < 0) {
        throw new ValidationError("Payment amount must be a non-negative number");
      }
      const normalizedMethod = payment.paymentMethodId.trim().toLowerCase();
      if (normalizedMethod === "cash") {
        if (typeof payment.tendered !== "number" || payment.tendered < payment.amount) {
          throw new ValidationError("Cash tendered must be greater than or equal to payment amount");
        }
      }
    }

    await this.sales.save(sale);

    for (const payment of payments) {
      const salePayment = SalePayment.create({
        id: newId(),
        saleId : sale.id,
        paymentMethodId: payment.paymentMethodId,
        amount: payment.amount,
        tendered: payment.tendered ?? null,
        changeDue: payment.changeDue ?? null,
      });
      await this.salePayments.save(salePayment);
    }
    return sale;
  }
}