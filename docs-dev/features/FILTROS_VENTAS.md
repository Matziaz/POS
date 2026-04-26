# README - Filtros de Ventas (estado actual)

## Resumen

La pantalla de Ventas implementa filtros por rango de fecha y hora integrados con la paginacion.

El filtro vigente usa un dropdown compacto con dos tabs (Rangos rapidos / Personalizado) en lugar de un dialog de pantalla completa.

Este documento refleja el estado vigente al 2026-04-25.

## UI de filtros

Archivos:

- src/interface/pages/SalesPage.tsx
- src/interface/components/sales/SalesDateTimeRangePicker.tsx
- src/interface/components/sales/QuickRanges.tsx
- src/interface/components/sales/CustomRangePicker.tsx
- src/interface/components/sales/dateTimeUtils.ts

Comportamiento actual:

- La pagina renderiza SalesDateTimeRangePicker con value=historyFilters.
- El picker muestra un boton compacto con el rango activo o "Todos los periodos".
- Al hacer clic se despliega un dropdown con dos tabs: Rangos rapidos y Personalizado.
- onApply aplica filtros y dispara fetchSalesHistory(1, historyPageSize, filters).
- onClear limpia filtros y dispara fetchSalesHistory(1, historyPageSize, {}).
- El usuario puede seleccionar presets rapidos o un rango personalizado con calendario e inputs nativos de fecha y hora.
- Incluye presets: Hoy, Ultimas 24h, Ultimos 7 dias, Ultimos 30 dias, Este mes, Mes pasado.

Validaciones en UI del picker:

- Debe existir rango valido.
- draftFrom < draftTo.
- Si falla, muestra mensaje local y no ejecuta la consulta.

## Estructura de componentes

El componente fue dividido en tres archivos para facilitar el mantenimiento:

- dateTimeUtils.ts — funciones puras de fecha (startOfDay, endOfDay, addDays, formatDateTime, etc.)
- QuickRanges.tsx — tab de presets rapidos con grid de opciones y acceso a personalizado
- CustomRangePicker.tsx — tab con calendario visual e inputs nativos de fecha y hora
- SalesDateTimeRangePicker.tsx — componente principal que orquesta estado, tabs y comunicacion con el store

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

1. Abrir Ventas y hacer clic en el boton de rango.
2. Seleccionar preset "Hoy" y validar resultados.
3. Ir a tab Personalizado, seleccionar rango con calendario e inputs de hora.
4. Probar rango invalido (inicio >= fin) y validar mensaje de error.
5. Paginar y verificar que el filtro permanece activo.
6. Limpiar y verificar regreso al listado global.