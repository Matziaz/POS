import { ValidationError } from "../errors";
import { AppConfiguration } from "../entities";
import type { AppConfigurationRepository } from "../repositories";

interface SaveInitialConfigurationInput {
  retailContext: string;
}

export class ConfigurationService {
  constructor(private readonly configurations: AppConfigurationRepository) {}

  async listAvailableContexts(): Promise<string[]> {
    return this.configurations.listAvailableContexts();
  }

  async getConfiguration(): Promise<AppConfiguration | null> {
    return this.configurations.findActive();
  }

  async isSetupComplete(): Promise<boolean> {
    return this.configurations.isSetupComplete();
  }

  async saveInitialConfiguration(input: SaveInitialConfigurationInput): Promise<AppConfiguration> {
    const retailContext = input.retailContext?.trim().toLowerCase();
    if (!retailContext) {
      throw new ValidationError("retail context is required");
    }

    const availableContexts = await this.configurations.listAvailableContexts();
    if (availableContexts.length === 0) {
      throw new ValidationError("No available retail contexts were found in database");
    }

    const normalized = availableContexts.map((context) => context.trim().toLowerCase());
    if (!normalized.includes(retailContext)) {
      throw new ValidationError("retail context is not available in database");
    }

    return this.configurations.activateByRetailContext(retailContext);
  }
}
