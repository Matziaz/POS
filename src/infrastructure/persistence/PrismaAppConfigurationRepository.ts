import type { PrismaClient } from "@prisma/client";
import { AppConfiguration } from "../../core/entities";
import type { AppConfigurationRepository } from "../../core/repositories";
import { prisma } from "../database/prismaClient";

interface AppConfigurationRow {
  id: string;
  retail_context: string;
  is_active: string | number | null;
}

function toDomain(row: AppConfigurationRow): AppConfiguration {
  return AppConfiguration.create({
    id: row.id,
    retailContext: row.retail_context,
    isActive: row.is_active,
  });
}

export class PrismaAppConfigurationRepository implements AppConfigurationRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findActive(): Promise<AppConfiguration | null> {
    const rows = await this.db.$queryRawUnsafe<AppConfigurationRow[]>(
      "SELECT id, retail_context, is_active FROM app_configuration WHERE is_active = 1 LIMIT 1"
    );

    if (rows.length === 0) return null;
    return toDomain(rows[0]);
  }

  async findById(id: string): Promise<AppConfiguration | null> {
    const rows = await this.db.$queryRawUnsafe<AppConfigurationRow[]>(
      "SELECT id, retail_context, is_active FROM app_configuration WHERE id = ? LIMIT 1",
      id
    );

    if (rows.length === 0) return null;
    return toDomain(rows[0]);
  }

  async listAvailableContexts(): Promise<string[]> {
    const rows = await this.db.$queryRawUnsafe<Array<{ retail_context: string }>>(
      "SELECT DISTINCT retail_context FROM app_configuration ORDER BY retail_context ASC"
    );

    return rows
      .map((row) => row.retail_context?.trim().toLowerCase())
      .filter((value): value is string => !!value);
  }

  async activateByRetailContext(retailContext: string): Promise<AppConfiguration> {
    const normalized = retailContext.trim().toLowerCase();

    await this.db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("UPDATE app_configuration SET is_active = 0");
      const updatedRows = await tx.$executeRawUnsafe(
        "UPDATE app_configuration SET is_active = 1 WHERE LOWER(retail_context) = LOWER(?)",
        normalized
      );

      if (!updatedRows) {
        throw new Error("retail context is not available in database");
      }
    });

    const active = await this.findActive();
    if (!active) {
      throw new Error("Unable to activate retail context");
    }

    return active;
  }

  async save(configuration: AppConfiguration): Promise<void> {
    const c = configuration.toJSON();

    await this.db.$executeRawUnsafe(
      `INSERT INTO app_configuration (id, retail_context, is_active)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET retail_context = excluded.retail_context, is_active = excluded.is_active`,
      c.id,
      c.retailContext,
      c.isActive
    );
  }

  async isSetupComplete(): Promise<boolean> {
    const config = await this.findActive();
    return config?.isSetupComplete ?? false;
  }
}
