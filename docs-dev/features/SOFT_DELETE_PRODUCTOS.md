# README: Borrado Logico y Restauracion de Productos

## Objetivo

Este cambio reemplaza la eliminacion fisica de productos por un **borrado logico** usando el campo `deleted_at`.

La meta es evitar errores por relaciones existentes con otras tablas, preservar la integridad referencial y ocultar del inventario solamente los productos eliminados.

Adicionalmente, ahora existe un flujo para **restaurar productos eliminados** sin volver a capturarlos desde cero.

---

## Resumen de lo que cambió

- Al eliminar un producto, ya no se borra el registro de la base de datos.
- En su lugar, se guarda una fecha en `deleted_at`.
- Los listados de productos activos ahora solo muestran registros con `deleted_at = null`.
- El flujo de ventas deja de considerar productos eliminados porque las busquedas por SKU y por ID ya filtran los inactivos.
- Se permite reutilizar un SKU cuando el producto anterior fue eliminado logicamente.
- Se agrego una pagina de restauracion para listar productos eliminados.
- Al restaurar, se solicita stock manual (entero mayor o igual a 0).
- Se agrego validacion para impedir restaurar si ya existe un producto activo con el mismo SKU.

---

## Motivación técnica

El borrado fisico rompia por las relaciones entre `product` y tablas como:

- `sale_item`
- `inventory_movement`

Como esos registros conservan el historico del negocio, no conviene eliminar el producto si ya fue usado en ventas o movimientos de inventario.

Con el borrado logico:

- se conserva el historial,
- se evita romper referencias,
- el inventario muestra solamente productos activos,
- y se habilita la recuperacion operativa de productos eliminados.

---

## Cambios realizados por capa

### 1) Base de datos / Prisma

- Se agregó el campo `deleted_at` al modelo `product`.
- Se ajustó la estrategia de unicidad para permitir reusar SKU en productos eliminados.

Archivo principal:

- [prisma/schema.prisma](../prisma/schema.prisma)

### 2) Dominio

- La entidad `Product` ahora conoce el estado de eliminación.
- `ProductProps` incluye `deletedAt`.
- `Product.create()` y `toJSON()` fueron actualizados para transportar ese dato.

Archivo:

- [src/core/entities/Product.ts](../src/core/entities/Product.ts)

### 3) Repositorios

- `delete(id)` ya no ejecuta un `DELETE` físico.
- Ahora marca el producto con fecha en `deleted_at`.
- `findById`, `findBySku` y `list` filtran solo productos activos.
- Se agregaron `listDeleted()` y `restore(id, stock)`.
- `restore` valida colision de SKU activo antes de reactivar.

Archivos:

- [src/infrastructure/persistence/PrismaProductRepository.ts](../src/infrastructure/persistence/PrismaProductRepository.ts)
- [src/interface/dev/InMemoryProductRepository.ts](../src/interface/dev/InMemoryProductRepository.ts)

### 4) Electron / IPC

- El handler `product:delete` ya no valida referencias para bloquear un borrado fisico.
- El conteo de productos por proveedor solo considera productos activos.
- Se actualizó el bridge de datos para incluir `deletedAt`.
- Se agregaron canales IPC para restauracion:
  - `product:listDeleted`
  - `product:restore`

Archivos:

- [src/electron/ipcHandlers.ts](../src/electron/ipcHandlers.ts)
- [src/electron/preload.ts](../src/electron/preload.ts)
- [src/electron.d.ts](../src/electron.d.ts)

### 5) Seed y pruebas

- Se ajustó la semilla para seguir funcionando con el esquema actual.
- Se corrigieron pruebas que dependían de campos requeridos por Prisma.
- Se removieron pruebas legacy asociadas a repositorios SQLite para evitar duplicidad.

Archivos:

- [prisma/seed.ts](../prisma/seed.ts)
- [src/core/services/**tests**/saleService.test.ts](../src/core/services/__tests__/saleService.test.ts)
- [src/core/services/**tests**/productService.test.ts](../src/core/services/__tests__/productService.test.ts)

### 6) UI de restauracion

- Se agrego una nueva pagina para visualizar productos eliminados.
- Se agrego un dialogo para restaurar capturando stock manual.
- Se agrego acceso desde sidebar y ruta dedicada.

Archivos:

- [src/interface/pages/DeletedProductsPage.tsx](../src/interface/pages/DeletedProductsPage.tsx)
- [src/interface/components/products/ProductRestoreDialog.tsx](../src/interface/components/products/ProductRestoreDialog.tsx)
- [src/interface/components/layout/SideBarData.tsx](../src/interface/components/layout/SideBarData.tsx)
- [src/App.tsx](../src/App.tsx)
- [src/interface/components/products/index.ts](../src/interface/components/products/index.ts)
- [src/interface/pages/index.ts](../src/interface/pages/index.ts)
- [src/interface/store/productStore.ts](../src/interface/store/productStore.ts)
- [src/interface/hooks/useProducts.ts](../src/interface/hooks/useProducts.ts)
- [src/interface/dev/ElectronProductRepository.ts](../src/interface/dev/ElectronProductRepository.ts)

---

## Flujo funcional esperado

### Al eliminar un producto

1. La UI llama al flujo de eliminación normal.
2. El repositorio marca `deleted_at` con una fecha ISO.
3. El producto deja de aparecer en inventario y en búsquedas activas.
4. El historial de ventas y movimientos permanece intacto.

### Al restaurar un producto

1. El usuario entra a la ruta `/inventario/restaurar`.
2. El sistema lista solo productos eliminados (`deleted_at != null`).
3. El usuario selecciona "Restaurar" e ingresa stock manual.
4. El backend valida que no exista colision de SKU activo.
5. Si todo es correcto, se limpia `deleted_at` y se actualiza el stock.
6. El producto vuelve a aparecer en inventario activo y desaparece de la lista de eliminados.

### Al listar productos

- Inventario y catálogos muestran solo productos con `deleted_at = null`.

### Al registrar ventas

- Si un producto fue eliminado lógicamente, no aparece en búsquedas por SKU y no puede venderse.

### Al listar productos eliminados

- La vista de restauracion solo muestra productos con `deleted_at` no nulo.

---

## Archivos afectados

- [prisma/schema.prisma](../prisma/schema.prisma)
- [prisma/seed.ts](../prisma/seed.ts)
- [src/core/entities/Product.ts](../src/core/entities/Product.ts)
- [src/core/repositories/ProductRepository.ts](../src/core/repositories/ProductRepository.ts)
- [src/infrastructure/persistence/PrismaProductRepository.ts](../src/infrastructure/persistence/PrismaProductRepository.ts)
- [src/interface/dev/InMemoryProductRepository.ts](../src/interface/dev/InMemoryProductRepository.ts)
- [src/interface/dev/ElectronProductRepository.ts](../src/interface/dev/ElectronProductRepository.ts)
- [src/electron/ipcHandlers.ts](../src/electron/ipcHandlers.ts)
- [src/electron/preload.ts](../src/electron/preload.ts)
- [src/electron.d.ts](../src/electron.d.ts)
- [src/interface/store/productStore.ts](../src/interface/store/productStore.ts)
- [src/interface/hooks/useProducts.ts](../src/interface/hooks/useProducts.ts)
- [src/interface/pages/DeletedProductsPage.tsx](../src/interface/pages/DeletedProductsPage.tsx)
- [src/interface/components/products/ProductRestoreDialog.tsx](../src/interface/components/products/ProductRestoreDialog.tsx)
- [src/interface/components/layout/SideBarData.tsx](../src/interface/components/layout/SideBarData.tsx)
- [src/App.tsx](../src/App.tsx)

---

## Validación realizada

- `npm run type-check` completado correctamente.
- Prisma Client regenerado después del cambio de esquema.

---

## Restricciones y errores esperados

- No se permite restaurar con stock negativo o no entero.
- No se permite restaurar si existe un producto activo con el mismo SKU.
- Si el producto no existe o no esta eliminado, la restauracion se rechaza.

---

## Nota de arquitectura

- Los archivos `SQLite*Repository` fueron eliminados del proyecto para reducir confusión.
- El flujo de persistencia vigente para productos es:
  - `PrismaProductRepository` en proceso main (Electron)
  - `ElectronProductRepository` e `InMemoryProductRepository` en renderer según entorno.

---

## Nota de despliegue local

Para que el cambio funcione en runtime, la base de datos local debe tener:

- la columna `deleted_at` en `product`,
- y la unicidad de SKU aplicada solo a productos activos.

Si la base local todavía usa el esquema anterior, primero hay que aplicar la migración o reconstruir la tabla de productos.
