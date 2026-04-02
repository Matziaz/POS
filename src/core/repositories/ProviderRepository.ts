import type { Provider } from "../entities";

export interface ProviderRepository {
  save(provider: Provider): Promise<void>;
  findById(id: string): Promise<Provider | null>;
  list(): Promise<Provider[]>;
}
