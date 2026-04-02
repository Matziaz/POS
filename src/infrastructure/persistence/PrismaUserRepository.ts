import type { PrismaClient } from "@prisma/client";
import { User } from "../../core/entities";
import type { UserRepository } from "../../core/repositories/UserRepository";
import { prisma } from "../database/prismaClient";

function toISOOrNow(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toDomain(row: any): User {
  return User.create({
    id: row.id,
    username: row.username,
    password: row.password,
    roleId: row.role_id,
    createdAt: toISOOrNow(row.created_at),
  });
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(user: User): Promise<void> {
    const u = user.toJSON();

    await this.db.user.upsert({
      where: { id: u.id },
      update: {
        username: u.username,
        password: u.password,
        role_id: u.roleId,
      },
      create: {
        id: u.id,
        username: u.username,
        password: u.password,
        role_id: u.roleId,
        created_at: toISOOrNow(u.createdAt),
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async list(): Promise<User[]> {
    const rows = await this.db.user.findMany({ orderBy: { created_at: "desc" as any } });
    return rows.map(toDomain);
  }
}
