import { prisma } from "../database/prismaClient.ts";

import type { ProductRepository } from "../../core/repositories/ProductRepository.ts";
import { Product } from "../../core/entities/Product.ts";


export class SQLiteProductRepository implements ProductRepository {
    async save(product: Product): Promise<void> {
        await prisma.product.create({
            data: {
                id: product.id,
                sku: product.sku,
                name: product.name,
                type_id: product.typeId,
                price: product.price,
                stock: product.stock,
                provider_id: product.providerId,
                image: product.image,
                created_at: product.createdAt
            }
        });
    }

    async update(product: Product): Promise<void> {
        await prisma.product.update({
            where: { 
                id: product.id 
            },
            data: {
                sku: product.sku,
                name: product.name,
                type_id: product.typeId,
                price: product.price,
                stock: product.stock,
                provider_id: product.providerId,
                image: product.image,
            }
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.product.delete({
            where: { id }
        });
    }


    async findById(id: string): Promise<Product | null> {
        const result = await prisma.product.findUnique({
            where: { id }
        });
        if (!result) return null;
        return this.toDomain(result);
    }


    async findBySku(sku: string): Promise<Product | null> {
        const result = await prisma.product.findUnique({
            where: { sku }
        });
        if (!result) return null;
        return this.toDomain(result);
    }


    async list(): Promise<Product[]> {
        const results = await prisma.product.findMany();
        return results.map(p => this.toDomain(p));
    }


    /**
     * Convierte Prisma → Domain Entity
     */
    private toDomain(prismaProduct: any): Product {
        return Product.create({
            id: prismaProduct.id,
            sku: prismaProduct.sku,
            name: prismaProduct.name,
            typeId: prismaProduct.type_id,
            price: prismaProduct.price,
            stock: prismaProduct.stock,
            providerId: prismaProduct.provider_id,
            image: prismaProduct.image,
            createdAt: prismaProduct.created_at
        });
    }
}

export{}