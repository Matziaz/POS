import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../database/prismaClient";
import { SQLiteSaleRepository } from "../SQLiteSaleRepository";
import { Sale } from "../../../core/entities/Sale";

const repo = new SQLiteSaleRepository();

describe("SQLiteSaleRepository - Integration Test", () => {
  beforeEach(async () => {
    await prisma.sale_item.deleteMany();
    await prisma.sale.deleteMany();

    await prisma.role.upsert({
      where: { id: "role-test" },
      update: { type: "ADMIN" },
      create: { id: "role-test", type: "ADMIN" },
    });

    await prisma.user.upsert({
      where: { id: "user-001" },
      update: {
        username: "admin-test",
        password: "secret",
        role_id: "role-test",
      },
      create: {
        id: "user-001",
        username: "admin-test",
        password: "secret",
        role_id: "role-test",
      },
    });

    await prisma.provider.upsert({
      where: { id: "provider-1" },
      update: { name: "Provider Test" },
      create: { id: "provider-1", name: "Provider Test" },
    });

    await prisma.product.upsert({
      where: { id: "prod-1" },
      update: {
        sku: "SKU-001",
        name: "Producto 1",
        price: 50,
        stock: 10,
        provider_id: "provider-1",
      },
      create: {
        id: "prod-1",
        sku: "SKU-001",
        name: "Producto 1",
        price: 50,
        stock: 10,
        provider_id: "provider-1",
      },
    });

    await prisma.product.upsert({
      where: { id: "prod-2" },
      update: {
        sku: "SKU-002",
        name: "Producto 2",
        price: 30,
        stock: 10,
        provider_id: "provider-1",
      },
      create: {
        id: "prod-2",
        sku: "SKU-002",
        name: "Producto 2",
        price: 30,
        stock: 10,
        provider_id: "provider-1",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should save a sale, persist it, and discount stock", async () => {
    const sale = Sale.create({
      id: "sale-1",
      userId: "user-001",
      items: [
        { id: "item-1", productId: "prod-1", quantity: 2, price: 50 },
      ],
    });

    await repo.save(sale);

    const found = await repo.findById("sale-1");
    console.log("FOUND IN TEST:", found);
    
    expect(found).not.toBeNull();
    expect(found?.id).toBe("sale-1");
    expect(found?.userId).toBe("user-001");
    expect(found?.total).toBe(100);
    expect(found?.items).toHaveLength(1);
    expect(found?.items[0]?.productId).toBe("prod-1");
    expect(found?.items[0]?.quantity).toBe(2);

    const product = await prisma.product.findUnique({ where: { id: "prod-1" } });
    expect(product?.stock).toBe(8);
  });

  it("should list all saved sales", async () => {
    const sale1 = Sale.create({
      id: "sale-1",
      userId: "user-001",
      items: [
        { id: "item-1", productId: "prod-1", quantity: 1, price: 50 },
      ],
    });

    const sale2 = Sale.create({
      id: "sale-2",
      userId: "user-001",
      items: [
        { id: "item-2", productId: "prod-2", quantity: 2, price: 30 },
      ],
    });

    await repo.save(sale1);
    await repo.save(sale2);

    const sales = await repo.list();
    const ids = sales.map((s) => s.id).sort();

    expect(sales).toHaveLength(2);
    expect(ids).toEqual(["sale-1", "sale-2"]);
  });

  it("should rollback transaction when stock is insufficient", async () => {
    const sale = Sale.create({
      id: "sale-insufficient",
      userId: "user-001",
      items: [
        { id: "item-x", productId: "prod-1", quantity: 999, price: 50 },
      ],
    });

    await expect(repo.save(sale)).rejects.toThrow("Insufficient stock");

    const notFound = await repo.findById("sale-insufficient");
    expect(notFound).toBeNull();

    const product = await prisma.product.findUnique({ where: { id: "prod-1" } });
    expect(product?.stock).toBe(10);
  });
});