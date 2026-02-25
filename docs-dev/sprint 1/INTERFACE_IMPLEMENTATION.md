# Interface Layer — Implementación Sprint 1

## Resumen

Se implementaron dos pantallas dentro de `src/interface/`:

1. **Inventario** — CRUD completo de productos (crear, ver, editar, eliminar)
2. **Ventas** — Historial de ventas con detalle por venta (ver, registrar)

Ambas consumen servicios y entidades definidos por Fer en `src/core/`. La persistencia real (Prisma/SQLite) **aún no está conectada** porque los repositorios de `infrastructure/` no han sido implementados por Alfredo. Se usan repositorios temporales en memoria (`dev/`) como sustitutos.

Se agregó navegación global con `react-router-dom` (HashRouter) y una barra de navegación superior con links a Inventario y Ventas.

---

## Arquitectura de la solución

```
src/interface/
├── components/
│   ├── ui/          ← Componentes base de shadcn/ui (7 archivos)
│   ├── layout/      ← Barra de navegación (AppLayout)
│   ├── products/    ← Componentes del CRUD de inventario
│   └── sales/       ← Componentes de la pantalla de ventas
├── hooks/           ← useProducts, useSales
├── pages/           ← InventoryPage, SalesPage
├── store/           ← productStore, salesStore (Zustand)
├── dev/             ← Repositorios temporales en memoria
└── lib/             ← Utilidad cn() para Tailwind
```

### Flujo de datos — Inventario

```
InventoryPage (pages/)
    ↓ usa
useProducts (hooks/)
    ↓ consume
productStore (store/ — Zustand)
    ↓ llama a
Product.create() + InMemoryProductRepository (dev/)
    ↑ importado de               ↑ sustituto temporal
    core/entities/               (debería ser SQLiteProductRepository
                                  de infrastructure/)
```

### Flujo de datos — Ventas

```
SalesPage (pages/)
    ↓ usa
useSales (hooks/)
    ↓ consume
salesStore (store/ — Zustand)
    ↓ llama a
SaleService.registerSale() + InMemorySaleRepository (dev/)
    ↑ importado de                    ↑ sustituto temporal
    core/services/                    (debería ser SQLiteSaleRepository
                                       de infrastructure/)
```

---

## Archivos implementados

### Pantalla de Inventario (CRUD de Productos)

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `src/interface/pages/InventoryPage.tsx` | Pantalla principal — título, botón "Nuevo Producto", contador, tabla, modales de crear/editar/eliminar, notificaciones inline |
| 2 | `src/interface/store/productStore.ts` | Store Zustand — `fetchProducts`, `addProduct`, `updateProduct`, `deleteProduct`, manejo de errores |
| 3 | `src/interface/hooks/useProducts.ts` | Hook — envuelve el store, carga automática al montar |
| 4 | `src/interface/components/products/ProductTable.tsx` | Tabla con SKU, Nombre, Precio, Stock (badges), Proveedor, Fecha, botones Editar/Eliminar |
| 5 | `src/interface/components/products/ProductForm.tsx` | Modal formulario — modo crear/editar, validación inline, campos: SKU, Nombre, Precio, Stock, Proveedor |
| 6 | `src/interface/components/products/ProductDeleteDialog.tsx` | Diálogo de confirmación para eliminar un producto |
| 7 | `src/interface/dev/InMemoryProductRepository.ts` | Repositorio temporal en memoria con 5 productos de ejemplo |

### Pantalla de Ventas (Historial + Detalle)

| # | Archivo | Descripción |
|---|---------|-------------|
| 8 | `src/interface/pages/SalesPage.tsx` | Pantalla principal — 3 tarjetas de resumen (ventas, ingresos, artículos), tabla de ventas |
| 9 | `src/interface/store/salesStore.ts` | Store Zustand — `fetchSales`, `registerSale`, enriquece items con nombres de producto |
| 10 | `src/interface/hooks/useSales.ts` | Hook — envuelve el store, carga automática al montar |
| 11 | `src/interface/components/sales/SalesTable.tsx` | Tabla con ID, Fecha, Hora, Usuario, # artículos, Total, botón "Ver detalle" |
| 12 | `src/interface/components/sales/SaleDetailDialog.tsx` | Modal con tabla de artículos (producto, cantidad, precio unitario, subtotal) y total |
| 13 | `src/interface/dev/InMemorySaleRepository.ts` | Repositorio temporal en memoria con 3 ventas de ejemplo |
| 14 | `src/interface/dev/InMemoryInventoryMovementRepository.ts` | Repositorio temporal de movimientos de inventario (requerido por `SaleService`) |

### Infraestructura compartida de UI

| # | Archivo | Descripción |
|---|---------|-------------|
| 15 | `src/interface/dev/serviceFactory.ts` | Factory singleton — instancia todos los servicios con repos en memoria, expone getters |
| 16 | `src/interface/components/layout/AppLayout.tsx` | Barra de navegación superior con links "Inventario" y "Ventas" |
| 17 | `src/interface/components/ui/*.tsx` | 7 componentes base shadcn/ui: Button, Input, Label, Table, Dialog, AlertDialog, Badge |
| 18 | `src/interface/lib/utils.ts` | Utilidad `cn()` para combinar clases Tailwind |

### Archivos raíz modificados/creados

| Archivo | Cambio |
|---------|--------|
| `tailwind.config.js` | **Creado** — config de Tailwind con theme de shadcn/ui |
| `postcss.config.js` | **Creado** — config de PostCSS para Tailwind |
| `src/index.css` | **Modificado** — agregué CSS variables de shadcn/ui |
| `src/App.tsx` | **Modificado** — HashRouter con rutas `/inventario` y `/ventas`, envuelto en `AppLayout` |

---

## Qué usé de core/ y shared/ (sin modificar)

| Archivo | Qué usé |
|---------|---------|
| `src/core/entities/Product.ts` | Clase `Product`, tipo `ProductProps`, métodos `create()`, `toJSON()`, `withStock()` |
| `src/core/entities/Sale.ts` | Clase `Sale`, tipo `SaleProps`, métodos `create()`, `toJSON()` |
| `src/core/entities/SaleItem.ts` | Clase `SaleItem`, tipo `SaleItemProps` |
| `src/core/entities/InventoryMovement.ts` | Clase `InventoryMovement` |
| `src/core/repositories/ProductRepository.ts` | Interfaz `ProductRepository` |
| `src/core/repositories/SaleRepository.ts` | Interfaz `SaleRepository` |
| `src/core/services/ProductService.ts` | Clase `ProductService` — `listProducts()` |
| `src/core/services/SaleService.ts` | Clase `SaleService` — `registerSale()` |
| `src/core/services/id.ts` | Función `newId()` para generar UUIDs |
| `src/core/constants.ts` | `DEFAULT_PROVIDER_ID`, `DEFAULT_USER_ID` |
| `src/shared/constants/index.ts` | `CURRENCY_SYMBOL`, `DECIMAL_PLACES`, `APP_NAME` |

---

## Dependencias npm instaladas

```
react-router-dom          — navegación entre páginas
class-variance-authority  — variantes de estilo para componentes
clsx                      — utilidad para clases condicionales
tailwind-merge            — merge inteligente de clases Tailwind
lucide-react              — íconos (lápiz, basura, paquete, plus, ojo, carrito)
sonner                    — toasts (instalado, disponible para uso futuro)
@radix-ui/react-dialog    — primitiva accesible para modales
@radix-ui/react-alert-dialog — primitiva para diálogos de confirmación
@radix-ui/react-label     — primitiva para labels de formulario
@radix-ui/react-slot      — composición de componentes (Button asChild)
tailwindcss-animate       — animaciones para shadcn/ui (dev dep)
autoprefixer              — prefijos CSS automáticos (dev dep)
```

---

## Qué le toca a cada integrante para conectar todo

### Fer — core/

**Problemas actuales que bloquean la integración:**

1. **Bug en `ProductService.createProduct()`** (`src/core/services/ProductService.ts` línea 18):
   - Pasa `priceCents` a `Product.create()`, pero la entidad espera `price`
   - Falta `providerId` en el input (la entidad lo requiere)
   - **Fix:** Cambiar la firma a `{ sku, name, price, providerId?, stock? }` y pasar `price` a `Product.create()`

2. **Métodos faltantes en `ProductService`:**
   - `updateProduct(id: string, input: { name?, sku?, price?, stock?, providerId? })` — actualizar un producto existente
   - `deleteProduct(id: string)` — eliminar un producto
   - `getById(id: string)` — obtener producto por ID
   - Sin estos, la UI usa el repositorio directamente (workaround temporal)

3. **Método faltante en `ProductRepository`** (`src/core/repositories/ProductRepository.ts`):
   - Agregar `delete(id: string): Promise<void>` a la interfaz

4. **Archivo faltante: `InventoryMovementRepository.ts`** (`src/core/repositories/`):
   - El archivo es referenciado en `SaleService.ts` línea 4 y en `repositories/index.ts` línea 10, pero **no existe**
   - Esto causa error de compilación TS2307
   - **Fix:** Crear el archivo con la interfaz:
     ```typescript
     import type { InventoryMovement } from "../entities";
     export interface InventoryMovementRepository {
       save(movement: InventoryMovement): Promise<void>;
       listByProduct(productId: string): Promise<InventoryMovement[]>;
     }
     ```

5. **Métodos faltantes en `SaleService`** (opcionales, pero útiles para la UI):
   - `listSales()` — listar todas las ventas
   - `getSaleById(id: string)` — obtener venta por ID con sus items

### Alfredo — infrastructure/

**Archivos a implementar en `src/infrastructure/persistence/`:**

1. **`SQLiteProductRepository.ts`** — Implementar `ProductRepository` usando `prismaClient`:
   ```typescript
   import { prisma } from "../database/prismaClient";
   import { Product } from "@core/entities";
   import type { ProductRepository } from "@core/repositories";

   export class SQLiteProductRepository implements ProductRepository {
     async save(product: Product): Promise<void> {
       const data = product.toJSON();
       await prisma.product.upsert({
         where: { id: data.id },
         update: { name: data.name, sku: data.sku, price: data.price, stock: data.stock, provider_id: data.providerId },
         create: { id: data.id, name: data.name, sku: data.sku, price: data.price, stock: data.stock, provider_id: data.providerId, created_at: data.createdAt },
       });
     }
     async findById(id: string): Promise<Product | null> {
       const row = await prisma.product.findUnique({ where: { id } });
       if (!row) return null;
       return Product.create({ id: row.id, sku: row.sku, name: row.name, price: row.price, stock: row.stock, providerId: row.provider_id, createdAt: row.created_at });
     }
     async findBySku(sku: string): Promise<Product | null> {
       const row = await prisma.product.findUnique({ where: { sku } });
       if (!row) return null;
       return Product.create({ id: row.id, sku: row.sku, name: row.name, price: row.price, stock: row.stock, providerId: row.provider_id, createdAt: row.created_at });
     }
     async list(): Promise<Product[]> {
       const rows = await prisma.product.findMany();
       return rows.map((row) => Product.create({ id: row.id, sku: row.sku, name: row.name, price: row.price, stock: row.stock, providerId: row.provider_id, createdAt: row.created_at }));
     }
     async delete(id: string): Promise<void> {
       await prisma.product.delete({ where: { id } });
     }
   }
   ```

2. **`SQLiteSaleRepository.ts`** — Implementar `SaleRepository` usando `prismaClient`:
   ```typescript
   import { prisma } from "../database/prismaClient";
   import { Sale } from "@core/entities";
   import type { SaleRepository } from "@core/repositories";

   export class SQLiteSaleRepository implements SaleRepository {
     async save(sale: Sale): Promise<void> {
       const data = sale.toJSON();
       await prisma.sale.create({
         data: {
           id: data.id, user_id: data.userId, total: data.total, created_at: data.createdAt,
           sale_item: { create: data.items.map((item) => ({ id: item.id, product_id: item.productId, quantity: item.quantity, price: item.price })) },
         },
       });
     }
     async findById(id: string): Promise<Sale | null> {
       const row = await prisma.sale.findUnique({ where: { id }, include: { sale_item: true } });
       if (!row) return null;
       return Sale.create({
         id: row.id, userId: row.user_id, createdAt: row.created_at,
         items: row.sale_item.map((si) => ({ id: si.id, productId: si.product_id, quantity: si.quantity, price: si.price })),
       });
     }
     async list(): Promise<Sale[]> {
       const rows = await prisma.sale.findMany({ include: { sale_item: true } });
       return rows.map((row) => Sale.create({
         id: row.id, userId: row.user_id, createdAt: row.created_at,
         items: row.sale_item.map((si) => ({ id: si.id, productId: si.product_id, quantity: si.quantity, price: si.price })),
       }));
     }
   }
   ```

3. **`SQLiteInventoryMovementRepository.ts`** — Implementar `InventoryMovementRepository`:
   ```typescript
   import { prisma } from "../database/prismaClient";
   import { InventoryMovement } from "@core/entities";
   // import type { InventoryMovementRepository } from "@core/repositories";
   // ^ Usar cuando Fer cree el archivo

   export class SQLiteInventoryMovementRepository {
     async save(movement: InventoryMovement): Promise<void> {
       const data = movement.toJSON();
       await prisma.inventory_movement.create({
         data: { id: data.id, product_id: data.productId, type: data.type, quantity: data.quantity, created_at: data.createdAt },
       });
     }
     async listByProduct(productId: string): Promise<InventoryMovement[]> {
       const rows = await prisma.inventory_movement.findMany({ where: { product_id: productId } });
       return rows.map((row) => InventoryMovement.create({ id: row.id, productId: row.product_id, type: row.type as "IN" | "OUT", quantity: row.quantity, createdAt: row.created_at }));
     }
   }
   ```

4. **Actualizar `src/infrastructure/persistence/index.ts`** — exportar las 3 implementaciones.

### Diego — interface/ (yo)

**Cuando Fer y Alfredo terminen sus partes, yo hago la conexión:**

Cambiar `src/interface/dev/serviceFactory.ts` para usar los repos reales:

```typescript
// ANTES (desarrollo):
import { InMemoryProductRepository } from "./InMemoryProductRepository"
import { InMemorySaleRepository } from "./InMemorySaleRepository"
import { InMemoryInventoryMovementRepository } from "./InMemoryInventoryMovementRepository"

const productRepository = new InMemoryProductRepository()
const saleRepository = new InMemorySaleRepository()
const inventoryMovementRepository = new InMemoryInventoryMovementRepository()

// DESPUÉS (integración):
import { SQLiteProductRepository } from "@infrastructure/persistence/SQLiteProductRepository"
import { SQLiteSaleRepository } from "@infrastructure/persistence/SQLiteSaleRepository"
import { SQLiteInventoryMovementRepository } from "@infrastructure/persistence/SQLiteInventoryMovementRepository"

const productRepository = new SQLiteProductRepository()
const saleRepository = new SQLiteSaleRepository()
const inventoryMovementRepository = new SQLiteInventoryMovementRepository()
```

Son **3 líneas de import** y **3 líneas de instanciación** — el resto de la UI no cambia.

También: cuando Fer corrija `ProductService`, eliminar los workarounds en `productStore.ts` que usan el repo directamente y usar el servicio para todo.

---

## Orden de integración recomendado

```
1. Fer crea InventoryMovementRepository.ts en core/repositories/     ← Desbloquea compilación
2. Fer corrige ProductService.createProduct() (price, providerId)    ← Desbloquea CRUD limpio
3. Fer agrega update/delete a ProductService y ProductRepository     ← Desbloquea CRUD completo
4. Alfredo implementa SQLiteProductRepository                        ← Desbloquea datos reales de productos
5. Alfredo implementa SQLiteSaleRepository                           ← Desbloquea datos reales de ventas
6. Alfredo implementa SQLiteInventoryMovementRepository              ← Desbloquea registro de ventas real
7. Diego cambia serviceFactory.ts (6 líneas)                         ← Todo conectado
```
