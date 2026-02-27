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
