import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../database/prismaClient";
import { SQLiteProductRepository } from "../SQLiteProductRepository";
import { Product } from "../../../core/entities/Product";

const repo = new SQLiteProductRepository();

describe("SQLiteProductRepository - Integration Test", () => {

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.product.deleteMany({
      where: {
        id: {
          in: ["test-id-1", "test-id-2"]
        }
      }
    });

    await prisma.$disconnect();
  });

  it("should save a product and persist it in database", async () => {

    const product = Product.create({
      id: "test-id-1",
      sku: "SKU-001",
      name: "Test Product",
      price: 100,
      providerId: "provider_default"
    });

    await repo.save(product);

    const found = await repo.findById("test-id-1");
    console.log("FOUND IN TEST:", found);

    expect(found).not.toBeNull();
    expect(found?.name).toBe("Test Product");
    expect(found?.price).toBe(100);

  });


  it("should find product by SKU", async () => {

    const found = await repo.findBySku("SKU-001");
    console.log("FOUND IN TEST:", found);

    expect(found).not.toBeNull();
    expect(found?.sku).toBe("SKU-001");

  });


  it("should update a product", async () => {

    const updatedProduct = Product.create({
      id: "test-id-1",
      sku: "SKU-001",
      name: "Updated Name",
      price: 150,
      providerId: "provider_default",
      stock: 10
    });

    await repo.update(updatedProduct);

    const found = await repo.findById("test-id-1");
    console.log("FOUND IN TEST:", found);

    expect(found?.name).toBe("Updated Name");
    expect(found?.price).toBe(150);
    expect(found?.stock).toBe(10);

  });


  it("should list products", async () => {

    const products = await repo.list();

    expect(products.length).toBeGreaterThan(0);

  });

});