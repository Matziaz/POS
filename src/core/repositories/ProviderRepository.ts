import type { Provider } from "../entities";

export interface ProviderRepository {
  save(provider: Provider): Promise<void>;
  update(provider: Provider): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Provider | null>;
  list(): Promise<Provider[]>;
}
