import type { AppConfiguration } from "../entities";

export interface AppConfigurationRepository {
  findActive(): Promise<AppConfiguration | null>;
  findById(id: string): Promise<AppConfiguration | null>;
  listAvailableContexts(): Promise<string[]>;
  activateByRetailContext(retailContext: string): Promise<AppConfiguration>;
  save(configuration: AppConfiguration): Promise<void>;
  isSetupComplete(): Promise<boolean>;
}
