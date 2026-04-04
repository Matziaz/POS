import { describe, expect, it } from "vitest";

import {
  Product,
  Provider,
  Role,
  User,
  InventoryMovement,
  Sale,
} from "../../entities";

import { SaleService } from "../SaleService";

import type { ProductRepository, SaleRepository } from "../../repositories";
import type { InventoryMovementRepository } from "../../repositories/InventoryMovementRepository";

import { DEFAULT_USER_ID, DEFAULT_PROVIDER_ID } from "../../../shared/constants/constants";

// -------- In-memory repos --------

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

function inMemorySaleRepo(): SaleRepository {
  const byId = new Map<string, Sale>();
  const findInRange = (from: Date, to: Date): Sale[] => {
    const fromMs = from.getTime();
    const toMs = to.getTime();
    return [...byId.values()].filter((sale) => {
      const createdAt = new Date(sale.createdAt).getTime();
      return createdAt >= fromMs && createdAt < toMs;
    });
  };

  return {
    async save(s) { byId.set(s.id, s); },
    async findById(id) { return byId.get(id) ?? null; },
    async list() { return [...byId.values()]; },
    async findByDateRange(from, to) { return findInRange(from, to); },
    async sumTotalByDateRange(from, to) {
      const sales = findInRange(from, to);
      return sales.reduce((sum, sale) => sum + sale.total, 0);
    },
    async countByDateRange(from, to) {
      const sales = findInRange(from, to);
      return sales.length;
    },
  };
}

function inMemoryInventoryMovementRepo() {
  const items: InventoryMovement[] = [];
  return {
    async save(m: InventoryMovement) { items.push(m); },
    async listByProduct(productId: string) { return items.filter((m) => m.productId === productId); },
    _all() { return items; }, // helper para test
  } as InventoryMovementRepository & { _all: () => InventoryMovement[] };
}

// -------- Helpers (env parsing + logs) --------

type Line = { productSku: string; qty: number };

/**
 * LINES env format:
 *   "SKU-COKE:2,SKU-BREAD:1,SKU-COFFEE:1"
 * If not provided, uses default lines.
 */
function getLinesFromEnv(): Line[] {
  const raw = (process.env.LINES ?? "").trim();

  if (!raw) {
    return [
      { productSku: "SKU-COKE", qty: 2 },
      { productSku: "SKU-BREAD", qty: 1 },
      { productSku: "SKU-COFFEE", qty: 1 },
    ];
  }

  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);

  const lines: Line[] = parts.map((part) => {
    const [sku, qtyStr] = part.split(":").map((s) => s.trim());
    if (!sku) throw new Error(`Invalid LINES entry "${part}". Expected "SKU:QTY".`);

    const qty = Number(qtyStr);
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error(`Invalid qty in "${part}". QTY must be a positive integer.`);
    }

    return { productSku: sku, qty };
  });

  return lines;
}

async function printInventory(title: string, productsRepo: ProductRepository) {
  const inv = await productsRepo.list();
  console.log(`\n===== ${title} =====`);
  for (const p of inv) {
    console.log(
      `ID=${p.id}|SKU=${p.sku} | name=${p.name} | price=${p.price} | stock=${p.stock} | providerId=${p.providerId} | createdAt=${p.createdAt}`
    );
  }
  console.log("========================\n");
}

/**
 * Calcula total esperado y stocks esperados a partir de:
 * - inventario actual (repo)
 * - lines (SKU, qty)
 */
async function computeExpectations(productsRepo: ProductRepository, lines: Line[]) {
  let expectedTotal = 0;

  // expectedStockBySku: sku -> newStock
  const expectedStockBySku = new Map<string, number>();

  for (const line of lines) {
    const p = await productsRepo.findBySku(line.productSku);
    if (!p) throw new Error(`Test setup error: product not found for sku "${line.productSku}"`);

    expectedTotal += p.price * line.qty;
    expectedStockBySku.set(p.sku, p.stock - line.qty);
  }

  return { expectedTotal, expectedStockBySku };
}

// -------- Test --------

describe("SaleService flow (env-driven lines + dynamic expected total)", () => {
  it("prints inventory, reads LINES from env, runs SALE, and validates totals/stock/movements", async () => {
    // Seed entidades “extra” (para usar core completo a nivel entidades)
    const role = Role.create({ id: "role_admin", type: "ADMIN" });
    const user = User.create({
      id: DEFAULT_USER_ID,
      username: "admin",
      password: "admin123", // solo para seed del test
      roleId: role.id,
    });
    const provider = Provider.create({
      id: DEFAULT_PROVIDER_ID,
      name: "Proveedor Default",
      telephone: "555-0101",
      email: "proveedor@demo.com",
    });

    // 3 productos con campos completos
    const p1 = Product.create({
      id: "p1",
      sku: "SKU-COKE",
      name: "Coca",
      price: 15.5,
      stock: 10,
      providerId: provider.id,
      createdAt: "2026-02-21T00:00:00.000Z",
    });

    const p2 = Product.create({
      id: "p2",
      sku: "SKU-BREAD",
      name: "Pan",
      price: 8.0,
      stock: 5,
      providerId: provider.id,
      createdAt: "2026-02-21T00:01:00.000Z",
    });

    const p3 = Product.create({
      id: "p3",
      sku: "SKU-COFFEE",
      name: "Café",
      price: 32.25,
      stock: 3,
      providerId: provider.id,
      createdAt: "2026-02-21T00:02:00.000Z",
    });

    const products = inMemoryProductRepo([p1, p2, p3]);
    const sales = inMemorySaleRepo();
    const movements = inMemoryInventoryMovementRepo();

    const svc = new SaleService(products, sales, movements);

    // 1) Imprime inventario antes
    await printInventory("INVENTORY BEFORE", products);

    // 2) “Solicita acción” (simulada) + lee LINES del entorno
    console.log("Action requested: SALE");
    const lines = getLinesFromEnv();
    console.log("LINES (from env or default):", lines);

    // 3) Calcula expectativas dinámicas (SIN hardcode de total)
    const { expectedTotal, expectedStockBySku } = await computeExpectations(products, lines);

    // 4) Ejecuta la venta (sin userId para validar default)
    const sale = await svc.registerSale({ lines });

    // 5) Assertions principales
    expect(sale.userId).toBe(DEFAULT_USER_ID);
    expect(sale.items).toHaveLength(lines.length);

    // Total calculado dinámicamente
    expect(sale.total).toBeCloseTo(expectedTotal, 5);

    // Stock esperado dinámicamente
    for (const [sku, expectedStock] of expectedStockBySku.entries()) {
      const p = await products.findBySku(sku);
      expect(p).not.toBeNull();
      expect(p!.stock).toBe(expectedStock);
    }

    // Movimientos: uno por línea, todos OUT
    const allMovements = movements._all();
    expect(allMovements).toHaveLength(lines.length);
    expect(allMovements.every((m) => m.type === "OUT")).toBe(true);

    // 6) Logs: imprime venta y movimientos
    console.log("SALE:", sale.toJSON());
    console.log("MOVEMENTS:", allMovements.map((m) => m.toJSON()));

    // 7) Imprime inventario después
    await printInventory("INVENTORY AFTER", products);

    // Solo para “usar” las entidades extra (role/user/provider) en el test:
    expect(role.id).toBe("role_admin");
    expect(user.id).toBe(DEFAULT_USER_ID);
    expect(provider.id).toBe(DEFAULT_PROVIDER_ID);
  });
});