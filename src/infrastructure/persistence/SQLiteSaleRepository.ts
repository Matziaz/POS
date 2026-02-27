import { prisma } from "../database/prismaClient.ts";

import type { SaleRepository } from "../../core/repositories/SaleRepository.ts";
import { Sale } from "../../core/entities/Sale.ts";


export class SQLiteSaleRepository implements SaleRepository {

    async save(sale: Sale): Promise<void> {

        await prisma.sale.upsert({
            where: {
                id: sale.id},
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
    }


    async findById(id: string): Promise<Sale | null> {
        const result = await prisma.sale.findUnique({
            where: { id }
        });
        if (!result) return null;
        return this.toDomain(result);
    }


    async list(): Promise<Sale[]> {
        const results = await prisma.sale.findMany();
        return results.map(p => this.toDomain(p));
    }


    /**
     * Convierte Prisma → Domain Entity
     */
    private toDomain(prismaSale: any): Sale {
        return Sale.create({
            id: prismaSale.id,
            userId: prismaSale.user_id,
            total: prismaSale.total,
            createdAt: prismaSale.created_at
        });
    }
}