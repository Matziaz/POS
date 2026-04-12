import type { Role } from "../entities";

export interface RoleRepository {
  save(role: Role): Promise<void>;
  update(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Role | null>;
  findByType(type: string): Promise<Role | null>;
  list(): Promise<Role[]>;
  countUsersUsingRole(roleId: string): Promise<number>;
}
