import type { User } from "../entities";

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  list(): Promise<User[]>;
}
