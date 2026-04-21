# README - Paginacion de Ventas (estado actual)

## Resumen

La pantalla de Ventas usa paginacion real de extremo a extremo:

- UI con indicadores de rango y pagina.
- Store Zustand con estado paginado persistente.
- Repositorio + IPC + persistencia con total sincronizado.

Este documento refleja el estado vigente al 2026-04-20.

## Comportamiento en UI

Archivo principal:

- src/interface/pages/SalesPage.tsx

Implementacion actual:

- Al montar la pagina se llama fetchSalesHistory(1, historyPageSize, historyFilters).
- Se muestra "Mostrando X-Y de N ventas" cuando hay resultados.
- Se muestra "Pagina P de T".
- Navegacion con botones "Anterior" y "Siguiente".
- Los botones se deshabilitan cuando no hay pagina previa/siguiente o cuando isLoading es true.

Calculos actuales:

- totalPages = max(1, ceil(historyTotal / historyPageSize)).
- currentRange se calcula con historyPage, historyPageSize e historyTotal.

## Estado en store y hook

Archivos:

- src/interface/store/salesStore.ts
- src/interface/hooks/useSales.ts

Datos expuestos para paginacion:

- historyTotal
- historyPage
- historyPageSize
- historyFilters (se conserva al paginar)

Operacion principal:

- fetchSalesHistory(page?, pageSize?, filters?)

Reglas aplicadas:

- page y pageSize se normalizan a valores seguros.
- El store mantiene consistencia entre pagina, total y filtros.
- registerSale refresca historial respetando pagina/filtros actuales.
- Se evita race condition con latestHistoryRequestId para ignorar respuestas viejas.

## Flujo de datos

1. SalesPage invoca fetchSalesHistory.
2. useSales delega a useSaleStore.
3. El store llama listPaginated(page, pageSize, filters) en el repositorio.
4. ElectronSaleRepository usa window.electronAPI.saleListPaginated.
5. En main, el handler sale:listPaginated valida y delega a PrismaSaleRepository.
6. Prisma retorna sales + total, y la UI renderiza la pagina actual.

## Archivos tecnicos involucrados

- src/core/repositories/SaleRepository.ts
- src/interface/dev/ElectronSaleRepository.ts
- src/electron/preload.ts
- src/electron.d.ts
- src/electron/ipcHandlers.ts
- src/infrastructure/persistence/PrismaSaleRepository.ts
- src/interface/dev/InMemorySaleRepository.ts

## Prueba rapida

1. Abrir Ventas con datos cargados.
2. Verificar rango y total mostrados.
3. Ir a Siguiente y regresar a Anterior.
4. Confirmar disabled en primera y ultima pagina.
5. Confirmar que al registrar una nueva venta el historial se mantiene consistente.
