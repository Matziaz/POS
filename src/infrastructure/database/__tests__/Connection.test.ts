import { test } from "vitest";
import { prisma } from "../prismaClient";

test("database connection - fetch products", async () => {
    console.log("Conectando...");
    await prisma.$connect();
    const products = await prisma.product.findMany();
    console.log(products);
    await prisma.$disconnect();
});

