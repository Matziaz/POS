import { prisma } from "./prismaClient.js";

export async function testConnection() {
    console.log("Conectando...");
    const products = await prisma.product.findMany();
    console.log(products);
}

