import { prisma } from "./prismaClient.js";

async function main() {

    console.log("Conectando...");

    const products = await prisma.product.findMany();

    console.log(products);

}

main();