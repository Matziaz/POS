import { ProductType, Role } from "../entities";
import { NotFoundError, ValidationError } from "../errors";
import type { ProductTypeRepository, RoleRepository } from "../repositories";
import { newId } from "./id";

export class AdminSetupService {
  constructor(
    private readonly productTypes: ProductTypeRepository,
    private readonly roles: RoleRepository
  ) {}

  async listProductTypes(): Promise<ProductType[]> {
    return this.productTypes.list();
  }

  async listDeletedProductTypes(): Promise<ProductType[]> {
    return this.productTypes.listDeleted();
  }

  async createProductType(input: { name: string }): Promise<ProductType> {
    const name = input.name?.trim();
    if (!name) throw new ValidationError("product type name is required");

    const duplicate = await this.productTypes.findByName(name);
    if (duplicate) throw new ValidationError(`Product type already exists: ${name}`);

    const created = ProductType.create({
      id: newId(),
      name,
    });

    await this.productTypes.save(created);
    return created;
  }

  async updateProductType(input: { id: string; name: string }): Promise<ProductType> {
    const id = input.id?.trim();
    const name = input.name?.trim();

    if (!id) throw new ValidationError("product type id is required");
    if (!name) throw new ValidationError("product type name is required");

    const existing = await this.productTypes.findById(id);
    if (!existing) throw new NotFoundError(`Product type not found for id: ${id}`);

    if (name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await this.productTypes.findByName(name);
      if (duplicate && duplicate.id !== existing.id) {
        throw new ValidationError(`Product type already exists: ${name}`);
      }
    }

    const updated = ProductType.create({ id: existing.id, name });
    await this.productTypes.update(updated);

    return updated;
  }

  async deleteProductType(idRaw: string): Promise<void> {
    const id = idRaw?.trim();
    if (!id) throw new ValidationError("product type id is required");

    const existing = await this.productTypes.findById(id);
    if (!existing) throw new NotFoundError(`Product type not found for id: ${id}`);

    const usageCount = await this.productTypes.countProductsUsingType(id);
    if (usageCount > 0) {
      throw new ValidationError(
        `Cannot delete product type; it is used by ${usageCount} product(s)`
      );
    }
  

    await this.productTypes.delete(id);
  }

  async restoreProductType(idRaw: string): Promise<void> {
    const id = idRaw?.trim();
    if (!id) throw new ValidationError("product type id is required");

    const existing = await this.productTypes.findById(id);
    if (!existing) throw new NotFoundError(`Product type not found for id: ${id}`);

    await this.productTypes.restore(id);
  }

  async listRoles(): Promise<Role[]> {
    return this.roles.list();
  }

  async createRole(input: { type: string }): Promise<Role> {
    const type = input.type?.trim().toUpperCase();
    if (!type) throw new ValidationError("role type is required");

    const duplicate = await this.roles.findByType(type);
    if (duplicate) throw new ValidationError(`Role already exists: ${type}`);

    const created = Role.create({
      id: newId(),
      type,
    });

    await this.roles.save(created);
    return created;
  }

  async updateRole(input: { id: string; type: string }): Promise<Role> {
    const id = input.id?.trim();
    const type = input.type?.trim().toUpperCase();

    if (!id) throw new ValidationError("role id is required");
    if (!type) throw new ValidationError("role type is required");

    const existing = await this.roles.findById(id);
    if (!existing) throw new NotFoundError(`Role not found for id: ${id}`);

    if (type !== existing.type.toUpperCase()) {
      const duplicate = await this.roles.findByType(type);
      if (duplicate && duplicate.id !== existing.id) {
        throw new ValidationError(`Role already exists: ${type}`);
      }
    }

    const updated = Role.create({ id: existing.id, type });
    await this.roles.update(updated);

    return updated;
  }

  async deleteRole(idRaw: string): Promise<void> {
    const id = idRaw?.trim();
    if (!id) throw new ValidationError("role id is required");

    const existing = await this.roles.findById(id);
    if (!existing) throw new NotFoundError(`Role not found for id: ${id}`);

    const usageCount = await this.roles.countUsersUsingRole(id);
    if (usageCount > 0) {
      throw new ValidationError(`Cannot delete role; it is used by ${usageCount} user(s)`);
    }

    await this.roles.delete(id);
  }
}
