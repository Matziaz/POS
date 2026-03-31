import { SQLiteProductRepository } from "../../infrastructure/persistence/SQLiteProductRepository.ts";
import { Product } from "../entities/Product.ts";

const repo = new SQLiteProductRepository();

async function test(){

    console.log("Testing ProductRepository...");

    const product = Product.create({
        id: "prod-3",
        name: "Pepsi",
        sku: "PEPSI001",
        price: 20,
        stock: 100,
        providerId: "provider-1",
    });

    await repo.save(product);

    const products = await repo.list();

    console.log(products);

    const foundProduct = await repo.findById("prod-2");

    console.log("Found product:", foundProduct?.toJSON());

}

test();