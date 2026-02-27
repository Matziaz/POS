import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '../../../infrastructure/database/prismaClient';
import { SQLiteProductRepository } from '../../../infrastructure/persistence/SQLiteProductRepository';
import { Product } from '../../entities/Product';

const repo = new SQLiteProductRepository();

describe('SQLiteProductRepository', () => {
  beforeEach(async () => {
    // clean minimal tables used by the test
    await prisma.sale_item.deleteMany().catch(() => {});
    await prisma.sale.deleteMany().catch(() => {});
    await prisma.inventory_movement.deleteMany().catch(() => {});
    await prisma.product.deleteMany().catch(() => {});
    await prisma.provider.deleteMany().catch(() => {});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should save and find product by id and sku', async () => {
    // ensure provider exists (FK)
    await prisma.provider.create({ data: { id: 'provider-1', name: 'Provider 1' } });

    const product = Product.create({
      id: 'prod-1',
      name: 'Pepsi',
      sku: 'PEPSI001',
      price: 20,
      stock: 100,
      providerId: 'provider-1',
    });

    await repo.save(product);

    const byId = await repo.findById('prod-1');
    console.log('found byId:', byId?.toJSON());
    expect(byId).not.toBeNull();
    expect(byId?.id).toBe(product.id);
    expect(byId?.sku).toBe(product.sku);

    const bySku = await repo.findBySku(product.sku);
    console.log('found bySku:', bySku?.toJSON());
    expect(bySku).not.toBeNull();
    expect(bySku?.id).toBe(product.id);
    expect(bySku?.sku).toBe(product.sku);
  });
});
