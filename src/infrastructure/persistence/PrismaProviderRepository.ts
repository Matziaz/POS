import type { PrismaClient } from "@prisma/client";
import { Provider } from "../../core/entities";
import type { ProviderRepository } from "../../core/repositories/ProviderRepository";
import { prisma } from "../database/prismaClient";

function toDomain(row: any): Provider {
  return Provider.create({
    id: row.id,
    name: row.name,
    telephone: row.telephone,
    email: row.email,
    image: row.image ?? "",
  });
}

export class PrismaProviderRepository implements ProviderRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(provider: Provider): Promise<void> {
    const p = provider.toJSON();

    await this.db.provider.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        telephone: p.telephone ?? null,
        email: p.email ?? null,
        image: p.image || null,
      },
      create: {
        id: p.id,
        name: p.name,
        telephone: p.telephone ?? null,
        email: p.email ?? null,
        image: p.image || null,
      },
    });
  }

  async update(provider: Provider): Promise<void> {
    const p = provider.toJSON();

    await this.db.provider.update({
      where: { id: p.id },
      data: {
        name: p.name,
        telephone: p.telephone ?? null,
        email: p.email ?? null,
        image: p.image || null,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.provider.delete({ where: { id } });
  }

  async findById(id: string): Promise<Provider | null> {
    const row = await this.db.provider.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async list(): Promise<Provider[]> {
    const rows = await this.db.provider.findMany({ orderBy: { name: "asc" } });
    return rows.map(toDomain);
  }
}
