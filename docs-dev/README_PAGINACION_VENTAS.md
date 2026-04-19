# README - Reporte de paginacion en historial de ventas

## Resumen

En esta entrega se implemento paginacion para el historial de ventas en la pantalla de Ventas.

Objetivo principal:

- Evitar cargar todas las ventas en un solo fetch.
- Mostrar navegacion por pagina (Anterior/Siguiente).
- Mantener el total global de ventas para dar contexto al usuario.
- Conservar un flujo consistente desde UI hasta persistencia.

## Alcance funcional

### 1) UI de paginacion en pantalla de ventas

Archivo:

- src/interface/pages/SalesPage.tsx

Comportamiento aplicado:

- La pantalla carga historial paginado al montar (pagina 1, size actual del store).
- Se muestra indicador de rango actual: "Mostrando X-Y de N ventas".
- Se muestra indicador de pagina: "Pagina P de T".
- Se agregan botones "Anterior" y "Siguiente".
- Los botones se deshabilitan cuando:
  - no hay pagina anterior,
  - no hay pagina siguiente,
  - o hay una carga en curso (`isLoading`).

Calculos en UI:

- totalPages = ceil(historyTotal / historyPageSize), con minimo 1.
- currentRange = inicio-fin de la pagina actual segun historyPage, historyPageSize y historyTotal.

### 2) Estado de paginacion en store de ventas

Archivo:

- src/interface/store/salesStore.ts

Cambios relevantes:

- Se incorporan y exponen estos campos de estado:
  - historyTotal
  - historyPage
  - historyPageSize
- fetchSalesHistory recibe page y pageSize opcionales.
- Se normalizan parametros de entrada para evitar valores invalidos:
  - page: entero >= 1
  - pageSize: entero > 0
- Se invoca listPaginated en repositorio y se persiste en estado:
  - salesHistory (slice de la pagina)
  - historyTotal (conteo global)
  - historyPage
  - historyPageSize

### 3) Hook de ventas con metadata de paginacion

Archivo:

- src/interface/hooks/useSales.ts

Cambios relevantes:

- El hook expone historyTotal, historyPage y historyPageSize.
- El hook expone fetchSalesHistory(page?, pageSize?) para control desde UI.

### 4) Contrato de repositorio para listado paginado

Archivo:

- src/core/repositories/SaleRepository.ts

Contrato utilizado:

- listPaginated(page, pageSize) => { sales, total }

Esto separa claramente:

- datos de la pagina actual,
- y total de registros para calculo de paginas en la UI.

### 5) Implementacion en capa renderer (Electron repository)

Archivo:

- src/interface/dev/ElectronSaleRepository.ts

Cambios relevantes:

- listPaginated(page, pageSize) consume window.electronAPI.saleListPaginated.
- Reconstruye entidades Sale desde JSON para mantener compatibilidad con el dominio.

### 6) Bridge y contratos IPC (renderer <-> main)

Archivos:

- src/electron/preload.ts
- src/electron.d.ts
- src/electron/ipcHandlers.ts

Canal utilizado:

- sale:listPaginated

Comportamiento aplicado:

- El preload expone saleListPaginated(page, pageSize).
- electron.d.ts tipa el metodo y su retorno.
- ipcHandlers normaliza page/pageSize (safePage, safePageSize).
- ipcHandlers delega a saleRepository.listPaginated y retorna { sales, total }.

### 7) Implementaciones de persistencia

Archivos:

- src/infrastructure/persistence/PrismaSaleRepository.ts
- src/interface/dev/InMemorySaleRepository.ts

Comportamiento aplicado:

- PrismaSaleRepository:
  - Usa skip/take segun pagina y tamano.
  - Ordena por created_at desc.
  - Retorna total con count global.
- InMemorySaleRepository:
  - Ordena por createdAt desc.
  - Calcula slice por pagina.
  - Retorna total de ventas en memoria.
  - Incluye saneamiento de page/pageSize.

## Flujo de datos (end-to-end)

1. SalesPage solicita fetchSalesHistory(page, pageSize).
2. useSales delega al Zustand store.
3. salesStore llama repo.listPaginated(page, pageSize).
4. ElectronSaleRepository llama IPC sale:listPaginated.
5. ipcHandlers solicita a saleRepository.listPaginated.
6. Prisma/InMemory retornan { sales, total }.
7. UI renderiza tabla, rango y controles de navegacion.

## Impacto esperado

- Mejor rendimiento percibido en historiales largos.
- Menor carga inicial en pantalla de ventas.
- Mejor legibilidad operativa con contexto de pagina y total.
- Base lista para futuras mejoras (selector de pageSize, salto directo de pagina, filtros).

## Como probar

1. Levantar la app (Electron + renderer).
2. Ir a la pantalla de Ventas.
3. Verificar que carga pagina 1 y muestra rango + total.
4. Presionar Siguiente y validar cambio de pagina.
5. Presionar Anterior y validar retorno de pagina.
6. Confirmar estados disabled en bordes:
   - pagina 1 => Anterior disabled
   - ultima pagina => Siguiente disabled
7. Registrar una venta nueva y validar que el historial se mantiene paginado y consistente con total.

## Notas tecnicas

- Tamaño por defecto de pagina en store: 10.
- Hay saneamiento de parametros tanto en renderer store como en proceso main para robustez.
- Fecha del reporte: 2026-04-19.
