// src/core/services/__tests__/productService.test.ts
import { describe, expect, it } from "vitest";
import { ProductService } from "../ProductService";
import { Product } from "../../entities";
import { DEFAULT_PROVIDER_ID } from "../../../shared/constants/constants";
import { ValidationError } from "../../errors";
import type { ProductRepository } from "../../repositories";

function inMemoryProductRepo(seed: Product[] = []): ProductRepository {
  const byId = new Map(seed.map((p) => [p.id, p]));
  const bySku = new Map(seed.map((p) => [p.sku, p]));

  return {
    async save(p) { byId.set(p.id, p); bySku.set(p.sku, p); },
    async update(p) {
      // “update” exige que exista
      if (!byId.has(p.id)) throw new Error("not found");
      byId.set(p.id, p); bySku.set(p.sku, p);
    },
    async findById(id) { return byId.get(id) ?? null; },
    async findBySku(sku) { return bySku.get(sku) ?? null; },
    async list() { return [...byId.values()]; },
  };
}

describe("ProductService", () => {
  it("creates product, rejects duplicates/invalid price, and updates stock", async () => {
    const repo = inMemoryProductRepo();
    const svc = new ProductService(repo);

    // Crear producto
    const created = await svc.createProduct({
      sku: "SKU-AAA",
      name: "Galletas",
      price: 12.5,
      stock: 4,
      // providerId opcional -> default
    });

    expect(created.sku).toBe("SKU-AAA");
    expect(created.providerId).toBe(DEFAULT_PROVIDER_ID);
    expect(created.stock).toBe(4);

    // No permite SKU duplicado
    await expect(() =>
      svc.createProduct({ sku: "SKU-AAA", name: "Otro", price: 10, stock: 1 })
    ).rejects.toBeInstanceOf(ValidationError);

    // No permite precio inválido
    await expect(() =>
      svc.createProduct({ sku: "SKU-BBB", name: "Malo", price: 0, stock: 1 })
    ).rejects.toBeInstanceOf(ValidationError);

    // Inventario antes
    console.log("INVENTORY BEFORE:", (await repo.list()).map(p => p.toJSON()));

    // Set stock
    const updated = await svc.setStockBySku({ sku: "SKU-AAA", stock: 10 });
    expect(updated.stock).toBe(10);

    // Adjust stock
    const updated2 = await svc.adjustStockBySku({ sku: "SKU-AAA", delta: -3 });
    expect(updated2.stock).toBe(7);

    // Inventario después
    console.log("INVENTORY AFTER:", (await repo.list()).map(p => p.toJSON()));
  });
});