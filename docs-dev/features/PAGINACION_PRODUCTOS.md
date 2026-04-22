# README - Paginacion de Productos (estado actual)

## Resumen

La pantalla de Inventario usa paginacion real de extremo a extremo para productos activos.

- Carga por pagina desde repositorio.
- Total global sincronizado con el listado visible.
- Navegacion Anterior/Siguiente en UI.

Este documento refleja el estado vigente al 2026-04-20.

## UI de inventario

Archivo principal:

- src/interface/pages/InventoryPage.tsx

Comportamiento actual:

- Carga inicial con fetchInventoryProducts() al montar.
- Muestra "Mostrando X-Y de N productos" solo cuando no hay carga y existe al menos 1 producto.
- Muestra "Pagina P de T" solo cuando no hay carga y existe al menos 1 producto.
- Botones "Anterior" y "Siguiente" visibles en el mismo bloque de resumen, con disabled en bordes.

Parametros por defecto actuales:

- inventoryPage inicial: 1
- inventoryPageSize inicial: 12

## Estado en store y hook

Archivos:

- src/interface/store/productStore.ts
- src/interface/hooks/useProducts.ts

Estado expuesto para inventario:

- inventoryProducts
- inventoryTotal
- inventoryPage
- inventoryPageSize
- inventorySortBy
- inventorySortDirection
- isInventoryLoading

Operacion principal:

- fetchInventoryProducts(page?, pageSize?, sortBy?, sortDirection?)

Detalles vigentes:

- Se normalizan page y pageSize a enteros validos.
- Se conserva el estado de ordenamiento entre consultas.
- Se evita race condition con inventoryRequestId para ignorar respuestas fuera de orden.

## Integracion renderer-main-persistencia

Archivos:

- src/core/repositories/ProductRepository.ts
- src/interface/dev/ElectronProductRepository.ts
- src/electron/preload.ts
- src/electron.d.ts
- src/electron/ipcHandlers.ts
- src/infrastructure/persistence/PrismaProductRepository.ts

Flujo:

1. InventoryPage solicita fetchInventoryProducts.
2. useProducts delega a productStore.
3. productStore llama repo.listPaginated(page, pageSize, options).
4. ElectronProductRepository usa product:listPaginated por IPC.
5. PrismaProductRepository aplica skip/take + orderBy y retorna products + total.

Notas de persistencia:

- Solo lista productos activos (deleted_at = null).
- El total tambien considera solo activos.

## Prueba rapida

1. Abrir Inventario con al menos 13 productos activos.
2. Verificar pagina 1 con 12 elementos maximo.
3. Navegar a pagina 2 y volver.
4. Confirmar disabled de botones en primera y ultima pagina.
5. Crear/editar/eliminar un producto y validar refresco de pagina/total.
6. Durante carga, validar que no se renderiza temporalmente el bloque de resumen/paginacion.
