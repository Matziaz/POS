import { Sale, InventoryMovement } from "../entities";
import { NotFoundError, ValidationError } from "../errors";
import type { ProductRepository, SaleRepository} from "../repositories";
import type { InventoryMovementRepository } from "../repositories/InventoryMovementRepository";
import { newId } from "./id";
import { DEFAULT_USER_ID } from "../../shared/constants/constants";

export class SaleService {
  constructor(
    private readonly products: ProductRepository,
    private readonly sales: SaleRepository,
    private readonly movements: InventoryMovementRepository
  ) {}

  async registerSale(input: {
    userId?: string;
    lines: { productSku: string; qty: number }[];
    paymentMethod: 'cash' | 'card' | 'transfer';
  }): Promise<Sale> {
    const userId = input.userId?.trim() || DEFAULT_USER_ID;
    const lines = input.lines;

    if(!lines.length) throw new ValidationError("Sale must have at least one line");

    const saleId = newId();

    const items = [];
    for (const line of lines) {
      const p = await this.products.findBySku(line.productSku);
      if (!p) throw new NotFoundError(`Product with SKU ${line.productSku} not found`);
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

    const sale = Sale.create({ id: saleId, userId, items, paymentMethod: input.paymentMethod });
    await this.sales.save(sale);
    return sale;
  }
}