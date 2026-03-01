import { prisma } from "../database/prismaClient.ts";

import type { SaleRepository } from "../../core/repositories/SaleRepository.ts";
import { Sale } from "../../core/entities/Sale.ts";


export class SQLiteSaleRepository implements SaleRepository {

    async save(sale: Sale): Promise<void> {

        await prisma.$transaction(async (tx) => {

            await tx.sale.upsert({
            where: { id: sale.id },
            update: {
                user_id: sale.userId,
                total: sale.total,
                created_at: sale.createdAt
            },
            create: {
                id: sale.id,
                user_id: sale.userId,
                total: sale.total,
                created_at: sale.createdAt
            }
            });

            await tx.sale_item.deleteMany({
            where: { sale_id: sale.id }
            });

            for (const item of sale.items) {

            const product = await tx.product.findUnique({
                where: { id: item.productId }
            });

            if (!product || product.stock < item.quantity) {
                throw new Error("Insufficient stock");
            }

            await tx.product.update({
                where: { id: item.productId },
                data: { stock: product.stock - item.quantity }
            });

            await tx.sale_item.create({
                data: {
                id: item.id,
                sale_id: sale.id,
                product_id: item.productId,
                quantity: item.quantity,
                price: item.price
                }
            });

            }

        });

        }


    async findById(id: string): Promise<Sale | null> {
        const result = await prisma.sale.findUnique({
            where: { id },
            include: { sale_item: true }
        });
        if (!result) return null;
        return this.toDomain(result);
    }


    async list(): Promise<Sale[]> {
        const results = await prisma.sale.findMany({ include: { sale_item: true } });
        return results.map(p => this.toDomain(p));
    }


    /**
     * Convierte Prisma → Domain Entity
     */
    private toDomain(prismaSale: any): Sale {
        const items = (prismaSale.sale_item ?? []).map((si: any) => ({
            id: si.id,
            productId: si.product_id,
            quantity: si.quantity,
            price: si.price
        }));

        return Sale.create({
            id: prismaSale.id,
            userId: prismaSale.user_id,
            items,
            createdAt: prismaSale.created_at
        });
    }
}