# README - Filtros de Productos (estado actual)

## Resumen

La pantalla de Inventario implementa filtros por texto, tipo, proveedor y estado de stock integrados con la paginacion server-side.

Este documento refleja el estado vigente al 2026-04-25.

## Estado actual en UI

Archivos:

- src/interface/pages/InventoryPage.tsx
- src/interface/components/products/ProductTable.tsx

Capacidades vigentes:

- Busqueda por texto (nombre o SKU) con raw query LIKE en SQLite.
- Filtro por tipo de producto (typeId).
- Filtro por proveedor (providerId).
- Filtro por estado de stock: todos, con stock, stock bajo (<=5), sin stock.
- Ordenamiento por columnas clickeables: sku, name, typeId, price, stock, createdAt.
- Cada clic alterna asc/desc para el campo seleccionado.
- Todo filtro reinicia la vista a pagina 1.
- Los filtros se conservan al navegar entre paginas.

## Comportamiento del filtro en UI

- Barra de busqueda con icono Search de lucide-react — aplica al presionar Enter.
- Boton "Filtros" abre un dropdown con tres selectores: Tipo, Proveedor y Stock.
- El dropdown tiene botones Cancelar y Aplicar.
- El boton "Filtros" cambia a variante default cuando hay filtros activos.
- El boton "Limpiar" aparece solo cuando hay filtros activos y los resetea todos.

## Estado en store y repositorio

Archivos:

- src/interface/store/productStore.ts
- src/interface/hooks/useProducts.ts
- src/core/repositories/ProductRepository.ts
- src/infrastructure/persistence/PrismaProductRepository.ts
- src/interface/dev/ElectronProductRepository.ts
- src/interface/dev/InMemoryProductRepository.ts
- src/electron/ipcHandlers.ts
- src/electron/preload.ts
- src/electron.d.ts

Contrato vigente:

- listPaginated(page, pageSize, options?, filters?)
- options: sortBy, sortDirection
- filters: search, typeId, providerId, stockStatus

Implementacion vigente:

- ProductStore conserva inventoryFilters ademas de inventorySortBy y inventorySortDirection.
- fetchInventoryProducts acepta filters como quinto parametro opcional.
- Si no se pasan filters, se conservan los filtros activos del store.
- PrismaProductRepository construye un objeto where dinamico segun los filtros recibidos.
- La busqueda por texto usa $queryRaw con LOWER() y LIKE para compatibilidad con SQLite.
- count y findMany usan el mismo where para mantener total consistente con el filtrado.
- ElectronProductRepository pasa filters al canal IPC product:listPaginated.
- ipcHandlers recibe y delega filters al repositorio Prisma.

## Flujo funcional de filtros

1. Usuario escribe en la barra de busqueda y presiona Enter, o selecciona filtros en el dropdown y presiona Aplicar.
2. InventoryPage llama fetchInventoryProducts(1, inventoryPageSize, sortBy, sortDirection, filters).
3. ProductStore persiste los filtros y llama repo.listPaginated con options y filters.
4. ElectronProductRepository invoca window.electronAPI.productListPaginated(page, pageSize, options, filters).
5. ipcHandlers recibe los filtros y llama productRepository.listPaginated(page, pageSize, options, filters).
6. PrismaProductRepository construye el WHERE dinamico y retorna productos filtrados + total.
7. UI renderiza tabla y metadatos paginados actualizados.

## Flujo funcional de ordenamiento

1. Usuario hace clic en un encabezado sortable.
2. InventoryPage calcula nextDirection y llama fetchInventoryProducts(1, inventoryPageSize, field, nextDirection).
3. ProductStore persiste sortBy y sortDirection conservando los filtros activos.
4. Repositorio retorna pagina ordenada y filtrada segun options y filters.
5. UI renderiza tabla y metadatos paginados actualizados.

## Reglas funcionales

- Todo filtro o cambio de ordenamiento reinicia la vista a pagina 1.
- La navegacion Anterior/Siguiente conserva filtros y ordenamiento activos.
- El total mostrado siempre corresponde al conjunto filtrado.
- Limpiar filtros resetea search, typeId, providerId y stockStatus a vacio.

## Prueba rapida

1. Abrir Inventario y escribir un nombre parcial en la busqueda — presionar Enter.
2. Validar que solo aparecen productos que coinciden.
3. Abrir dropdown Filtros, seleccionar un tipo y presionar Aplicar.
4. Validar que la tabla muestra solo productos de ese tipo.
5. Combinar busqueda + tipo y validar resultados combinados.
6. Paginar y verificar que los filtros permanecen activos.
7. Presionar Limpiar y verificar regreso al listado completo.