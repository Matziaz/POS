import { Sale } from "../entities";
import { NotFoundError } from "../errors";
import type { ProductRepository, SaleRepository } from "../repositories";
import { newId } from "./id";

export class SaleService {
  constructor(
    private readonly products: ProductRepository,
    private readonly sales: SaleRepository
  ) {}

  async registerSale(lines: { productSku: string; qty: number }[]): Promise<Sale> {
    if (!lines.length) throw new Error("Sale lines must not be empty");

    const items = [];
    for (const line of lines) {
      const p = await this.products.findBySku(line.productSku);
      if (!p) throw new NotFoundError(`Product not found for sku: ${line.productSku}`);

      items.push({
        productId: p.id,
        skuSnapshot: p.sku,
        nameSnapshot: p.name,
        unitPriceCents: p.priceCents,
        qty: line.qty,
      });
    }

    const sale = Sale.create({ id: newId(), items });
    await this.sales.save(sale);
    return sale;
  }
}