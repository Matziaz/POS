# README - Filtros de Productos (estado actual)

## Resumen

En la pantalla actual de Inventario no existe aun un panel de filtros por texto, tipo o proveedor.

Lo que si existe hoy es ordenamiento por columnas, que cumple una funcion de refinamiento de vista y se integra con la paginacion server-side.

Este documento refleja el estado vigente al 2026-04-20.

## Estado actual en UI

Archivos:

- src/interface/pages/InventoryPage.tsx
- src/interface/components/products/ProductTable.tsx

Capacidades vigentes:

- Ordenamiento por columnas clickeables:
  - sku
  - name
  - typeId
  - price
  - stock
  - createdAt
- Cada clic alterna asc/desc para el campo seleccionado.
- Al cambiar ordenamiento, la vista vuelve a pagina 1.

No implementado aun en esta pantalla:

- Busqueda por texto.
- Filtro por tipo.
- Filtro por proveedor.
- Filtro por rango de precio o stock.

## Estado en store y repositorio

Archivos:

- src/interface/store/productStore.ts
- src/core/repositories/ProductRepository.ts
- src/infrastructure/persistence/PrismaProductRepository.ts

Contrato vigente:

- listPaginated(page, pageSize, options?)
- options actuales:
  - sortBy
  - sortDirection

Implementacion vigente:

- ProductStore conserva inventorySortBy y inventorySortDirection.
- PrismaProductRepository convierte sortBy/sortDirection en orderBy real de Prisma.
- El conteo total permanece consistente con el listado paginado.

## Flujo funcional de "filtro" vigente (ordenamiento)

1. Usuario hace clic en un encabezado sortable.
2. InventoryPage calcula nextDirection y llama fetchInventoryProducts(1, inventoryPageSize, field, nextDirection).
3. ProductStore persiste sortBy/sortDirection.
4. Repositorio retorna pagina ordenada segun options.
5. UI renderiza tabla y metadatos paginados actualizados.

## Recomendaciones para futura extension

Para habilitar filtros reales de inventario, la extension natural es:

1. Agregar ProductListFilters en el contrato de ProductRepository.
2. Extender product:listPaginated para recibir filters + sort.
3. Agregar controles en InventoryPage (search, tipo, proveedor, estado de stock).
4. Reiniciar a pagina 1 en cada cambio de filtro y mantener filtros en store.
