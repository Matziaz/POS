import type { PrismaClient } from "@prisma/client";
import { Role } from "../../core/entities";
import type { RoleRepository } from "../../core/repositories";
import { prisma } from "../database/prismaClient";

function toDomain(row: { id: string; type: string }): Role {
  return Role.create({
    id: row.id,
    type: row.type,
  });
}

export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async save(role: Role): Promise<void> {
    const r = role.toJSON();
    await this.db.role.create({
      data: {
        id: r.id,
        type: r.type,
      },
    });
  }

  async update(role: Role): Promise<void> {
    const r = role.toJSON();
    await this.db.role.update({
      where: { id: r.id },
      data: { type: r.type },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.role.delete({ where: { id } });
  }

  async findById(id: string): Promise<Role | null> {
    const row = await this.db.role.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByType(type: string): Promise<Role | null> {
    const row = await this.db.role.findFirst({ where: { type } });
    return row ? toDomain(row) : null;
  }

  async list(): Promise<Role[]> {
    const rows = await this.db.role.findMany({ orderBy: { type: "asc" } });
    return rows.map(toDomain);
  }

  async countUsersUsingRole(roleId: string): Promise<number> {
    return this.db.user.count({ where: { role_id: roleId } });
  }
}
