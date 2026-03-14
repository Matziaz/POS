// src/core/services/__tests__/productService.test.ts
import { describe, expect, it } from "vitest";
import { ProductService } from "../ProductService";
import { InventoryMovement, Product } from "../../entities";
import { DEFAULT_PROVIDER_ID } from "../../../shared/constants/constants";
import { ValidationError } from "../../errors";
import type { InventoryMovementRepository, ProductRepository } from "../../repositories";

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
    async delete(id) {
      const p = byId.get(id);
      if (p) {
        byId.delete(id);
        bySku.delete(p.sku);
      }
    },
    async list() { return [...byId.values()]; },
  };
}

function inMemoryInventoryMovementRepo() {
  const items: InventoryMovement[] = [];

  return {
    async save(movement: InventoryMovement) {
      items.push(movement);
    },
    async listByProduct(productId: string) {
      return items.filter((movement) => movement.productId === productId);
    },
    _all() {
      return items;
    },
  } as InventoryMovementRepository & { _all: () => InventoryMovement[] };
}

describe("ProductService", () => {
  it("creates product, rejects duplicates/invalid price, and records stock deltas", async () => {
    const repo = inMemoryProductRepo();
    const movements = inMemoryInventoryMovementRepo();
    const svc = new ProductService(repo, movements);

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
    expect(movements._all()).toHaveLength(1);
    expect(movements._all()[0].toJSON()).toMatchObject({
      productId: created.id,
      type: "IN",
      quantity: 4,
    });

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

    // Edición integral del producto con reducción de stock
    const updated3 = await svc.updateProduct({
      id: created.id,
      name: "Galletas Integrales",
      stock: 5,
      price: 13.5,
    });
    expect(updated3.name).toBe("Galletas Integrales");
    expect(updated3.price).toBe(13.5);
    expect(updated3.stock).toBe(5);

    // Edición sin cambio de stock no genera movimiento extra
    await svc.updateProduct({
      id: created.id,
      name: "Galletas Integrales Premium",
    });

    const allMovements = movements._all().map((movement) => movement.toJSON());
    expect(allMovements).toHaveLength(4);
    expect(allMovements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "IN", quantity: 4 }),
        expect.objectContaining({ type: "IN", quantity: 6 }),
        expect.objectContaining({ type: "OUT", quantity: 3 }),
        expect.objectContaining({ type: "OUT", quantity: 2 }),
      ])
    );

    // Inventario después
    console.log("INVENTORY AFTER:", (await repo.list()).map(p => p.toJSON()));
  });

  it("does not record movement when creating a product with zero stock", async () => {
    const repo = inMemoryProductRepo();
    const movements = inMemoryInventoryMovementRepo();
    const svc = new ProductService(repo, movements);

    const created = await svc.createProduct({
      sku: "SKU-ZERO",
      name: "Producto sin stock",
      price: 8,
      stock: 0,
    });

    expect(created.stock).toBe(0);
    expect(movements._all()).toHaveLength(0);
  });
});