import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

    // Limpiar métodos de pago anteriores
  await prisma.payment_methods.deleteMany();
  console.log('🧹 Métodos de pago limpiados');

  // Limpiar datos existentes (opcional - comentar si no quieres borrar)
  // await prisma.sale_item.deleteMany();
  // await prisma.sale.deleteMany();
  // await prisma.inventory_movement.deleteMany();
  // await prisma.product.deleteMany();
  // await prisma.provider.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.role.deleteMany();

  // 1. Crear roles
  const roleAdmin = await prisma.role.upsert({
    where: { id: 'role_admin' },
    update: {},
    create: {
      id: 'role_admin',
      type: 'ADMIN',
    },
  });

  const roleCashier = await prisma.role.upsert({
    where: { id: 'role_cashier' },
    update: {},
    create: {
      id: 'role_cashier',
      type: 'CASHIER',
    },
  });

  console.log('✅ Roles creados');

  // 2. Crear usuarios
  const userAdmin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: 'user_admin_001',
      username: 'admin',
      password: 'admin123', // En producción usar hash
      role_id: roleAdmin.id,
      created_at: new Date().toISOString(),
    },
  });

  const userCashier = await prisma.user.upsert({
    where: { username: 'cajero1' },
    update: {},
    create: {
      id: 'user_cashier_001',
      username: 'cajero1',
      password: 'cajero123', // En producción usar hash
      role_id: roleCashier.id,
      created_at: new Date().toISOString(),
    },
  });

  console.log('✅ Usuarios creados');

  // 3. Crear proveedores
  const providerDefault = await prisma.provider.upsert({
    where: { name: 'Proveedor General' },
    update: {},
    create: {
      id: 'provider_default',
      name: 'Proveedor General',
      telephone: '555-0000',
      email: 'contacto@proveedor.com',
    },
  });

  const providerCafe = await prisma.provider.upsert({
    where: { name: 'Cafetería del Sur' },
    update: {},
    create: {
      id: 'provider_cafe_001',
      name: 'Cafetería del Sur',
      telephone: '555-1234',
      email: 'ventas@cafedelsur.com'
    },
  });

  console.log('✅ Proveedores creados');

  // 4. Crear productos
  const productCoke = await prisma.product.upsert({
    where: { id: 'p1' },
    update: {},
    create: {
      id: 'p1',
      name: 'Coca Cola',
      sku: 'SKU-COKE',
      type_id: '1',
      price: 15.5,
      stock: 10,
      provider_id: providerDefault.id,
      created_at: new Date().toISOString(),
    },
  });

  const productBread = await prisma.product.upsert({
    where: { id: 'p2' },
    update: {},
    create: {
      id: 'p2',
      name: 'Pan Blanco',
      sku: 'SKU-BREAD',
      type_id: '1',
      price: 8.0,
      stock: 5,
      provider_id: providerDefault.id,
      created_at: new Date().toISOString(),
    },
  });

  const productCoffee = await prisma.product.upsert({
    where: { id: 'p3' },
    update: {},
    create: {
      id: 'p3',
      name: 'Café Premium',
      sku: 'SKU-COFFEE',
      type_id: '1',
      price: 32.25,
      stock: 3,
      provider_id: providerCafe.id,
      created_at: new Date().toISOString(),
    },
  });

  console.log('✅ Productos creados');

  // 5. Crear movimientos de inventario
  await prisma.inventory_movement.upsert({
    where: { id: 'inv_movement_001' },
    update: {},
    create: {
    id: 'inv_movement_001',
    product_id: productCoke.id,
    type: 'IN',
    quantity: 2,
    created_at: new Date().toISOString(),
  },
  });

  await prisma.inventory_movement.upsert({
    where: { id: 'inv_movement_002' },
    update: {},
    create: {
    id: 'inv_movement_002',
    product_id: productBread.id,
    type: 'OUT',
    quantity: 1,
    created_at: new Date().toISOString(),
  },
  });

  console.log('✅ Movimientos de inventario creados');

  // Crear caja registradora
  await prisma.cash_register.upsert({
    where: { id: 'cash_register_001' },
    update: {},
    create: {
      id: 'cash_register_001',
      opening_amount: 500,
      status: 'open',
      opened_at: new Date().toISOString(),
      opened_by_user_id: 'user_cashier_001',
    },
  });
  console.log('✅ Caja registradora creada');

  // 6. Crear venta de ejemplo
  const sale = await prisma.sale.upsert({
  where: { id: 'sale_001' },
  update: {},
  create: {
    id: 'sale_001',
    user_id: userCashier.id,
    cash_register_id: 'cash_register_001',
    total: 163.5,
    created_at: new Date().toISOString(),
  },
});

  await prisma.sale_item.upsert({
    where: { id: 'sale_item_001' },
    update: {},
    create: {
      id: 'sale_item_001',
      sale_id: sale.id,
      product_id: productCoke.id,
      quantity: 5,
      price: 15.5,
    },
});

await prisma.sale_item.upsert({
  where: { id: 'sale_item_002' },
  update: {},
  create: {
    id: 'sale_item_002',
    sale_id: sale.id,
    product_id: productCoffee.id,
    quantity: 2,
    price: 32.25,
  },
});
  // 7. Crear métodos de pago
await prisma.payment_methods.upsert({
  where: { id: 'cash' },
  update: {},
  create: {
    id: 'cash',
    method: 'cash',
    is_cash: 1,
    is_active: 1,
    display_order: 1,
  },
});

await prisma.payment_methods.upsert({
  where: { id: 'card' },
  update: {},
  create: {
    id: 'card',
    method: 'card',
    is_cash: 0,
    is_active: 1,
    display_order: 2,
  },
});

await prisma.payment_methods.upsert({
  where: { id: 'transfer' },
  update: {},
  create: {
    id: 'transfer',
    method: 'transfer',
    is_cash: 0,
    is_active: 1,
    display_order: 3,
  },
});

console.log('✅ Métodos de pago creados');

console.log('✅ Venta de ejemplo creada');

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
