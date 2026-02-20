import { describe, expect, it } from "vitest";
import { Product } from "../../entities";
import { SaleService } from "../SaleService";
import type { ProductRepository, SaleRepository } from "../../repositories";

function inMemoryProductRepo(seed: Product[] = []): ProductRepository {
  const byId = new Map(seed.map((p) => [p.id, p]));
  const bySku = new Map(seed.map((p) => [p.sku, p]));

  return {
    async save(p) { byId.set(p.id, p); bySku.set(p.sku, p); },
    async findById(id) { return byId.get(id) ?? null; },
    async findBySku(sku) { return bySku.get(sku) ?? null; },
    async list() { return [...byId.values()]; },
  };
}

function inMemorySaleRepo(): SaleRepository {
  const byId = new Map<string, any>();
  return {
    async save(s) { byId.set(s.id, s); },
    async findById(id) { return byId.get(id) ?? null; },
    async list() { return [...byId.values()]; },
  };
}

describe("SaleService", () => {
  it("calculates totals based on product snapshots", async () => {
    const p1 = Product.create({ id: "p1", sku: "SKU1", name: "Coca", priceCents: 1500 });
    const p2 = Product.create({ id: "p2", sku: "SKU2", name: "Pan", priceCents: 800 });

    const products = inMemoryProductRepo([p1, p2]);
    const sales = inMemorySaleRepo();
    const svc = new SaleService(products, sales);

    const sale = await svc.registerSale([
      { productSku: "SKU1", qty: 2 },
      { productSku: "SKU2", qty: 1 },
    ]);

    expect(sale.totalCents).toBe(1500 * 2 + 800 * 1);
    expect(sale.items).toHaveLength(2);
    expect(sale.items[0].lineTotalCents).toBe(1500 * 2);

    //Logs para verificar test
    console.log("TOTAL: ", sale.totalCents);
    console.log("ITEMS: ", sale.items);
  });
});

