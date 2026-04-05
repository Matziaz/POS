import type { User } from "../entities";

export interface UserRepository {
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  list(): Promise<User[]>;
}
