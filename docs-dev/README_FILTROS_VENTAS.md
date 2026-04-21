# README - Filtros de Ventas (estado actual)

## Resumen

La pantalla de Ventas implementa filtros por rango de fecha y hora integrados con la paginacion.

El filtro vigente usa un selector visual (dialog) y no inputs datetime-local directos.

Este documento refleja el estado vigente al 2026-04-20.

## UI de filtros

Archivos:

- src/interface/pages/SalesPage.tsx
- src/interface/components/sales/SalesDateTimeRangePicker.tsx

Comportamiento actual:

- La pagina renderiza SalesDateTimeRangePicker con value=historyFilters.
- El picker muestra estado visual "Activo" o "Sin filtro".
- onApply aplica filtros y dispara fetchSalesHistory(1, historyPageSize, filters).
- onClear limpia filtros y dispara fetchSalesHistory(1, historyPageSize, {}).
- El usuario puede seleccionar rango en calendario y ajustar hora/minuto.
- Incluye presets: hoy, ultimas 24 h y ultimos 7 dias.

Validaciones en UI del picker:

- Debe existir rango valido.
- draftFrom < draftTo.
- Si falla, muestra mensaje local y no ejecuta la consulta.

## Estado y validacion en store

Archivo:

- src/interface/store/salesStore.ts

Implementacion:

- historyFilters vive en el store.
- SaleHistoryFilters es alias de SaleListFilters.
- normalizeHistoryFilters valida ISO, limpia vacios y valida orden del rango.
- fetchSalesHistory mantiene filtros al navegar entre paginas.
- registerSale refresca historial respetando filtros activos.
- latestHistoryRequestId evita sobrescritura por respuestas viejas.

## Contratos y persistencia

Archivos:

- src/core/repositories/SaleRepository.ts
- src/interface/dev/ElectronSaleRepository.ts
- src/electron/preload.ts
- src/electron.d.ts
- src/electron/ipcHandlers.ts
- src/infrastructure/persistence/PrismaSaleRepository.ts
- src/interface/dev/InMemorySaleRepository.ts

Detalles tecnicos vigentes:

- listPaginated(page, pageSize, filters?) soporta filtros opcionales.
- El canal IPC sale:listPaginated valida formato y rango en main.
- Prisma aplica filtros sobre created_at con semantica:
  - fromISO: gte (inclusivo)
  - toISO: lt (exclusivo)
- count y findMany usan el mismo where para mantener total consistente.

## Reglas funcionales

- Todo filtro reinicia la vista a pagina 1.
- La navegacion Anterior/Siguiente conserva filtros activos.
- El total mostrado siempre corresponde al conjunto filtrado.

## Prueba rapida

1. Abrir Ventas y abrir el selector de rango.
2. Aplicar preset "hoy" y validar resultados.
3. Aplicar rango manual con fecha y hora.
4. Probar rango invalido (inicio >= fin) y validar mensaje.
5. Paginar y verificar que el filtro permanece.
6. Limpiar y verificar regreso al listado global.
