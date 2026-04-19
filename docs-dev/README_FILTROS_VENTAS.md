# README - Reporte de filtros en historial de ventas

## Resumen

En esta entrega se implementaron filtros por fecha y hora para el historial de ventas, manteniendo la paginacion funcional y consistente.

Objetivos principales:

- Filtrar ventas por rango temporal usando fecha y hora (desde y hasta).
- Conservar un unico flujo paginado con total filtrado.
- Evitar desalineaciones entre pagina actual, total y resultados visibles.
- Proteger el estado ante respuestas asincronas fuera de orden.

## Alcance funcional

### 1) UI de filtros en pantalla de ventas

Archivo:

- src/interface/pages/SalesPage.tsx

Comportamiento aplicado:

- Se agregan dos campos de entrada tipo datetime-local:
  - Desde
  - Hasta
- Se agregan acciones:
  - Aplicar filtros
  - Limpiar
- Al aplicar filtros:
  - Se valida que los valores sean parseables.
  - Se valida que desde sea menor que hasta.
  - Se solicita historial paginado en pagina 1 con filtros aplicados.
- Al limpiar filtros:
  - Se vacian los campos locales.
  - Se consulta pagina 1 sin filtros.
- La paginacion Anterior/Siguiente conserva los filtros activos al navegar.
- La UI muestra un indicador de filtros activos para dar contexto al usuario.

### 2) Estado de filtros en store de ventas

Archivo:

- src/interface/store/salesStore.ts

Cambios relevantes:

- Se agrega el estado historyFilters en el store.
- Se define SaleHistoryFilters como alias del contrato de filtros del repositorio.
- fetchSalesHistory ahora recibe opcionalmente page, pageSize y filters.
- Se implementa normalizeHistoryFilters para:
  - validar ISO de fromISO y toISO,
  - validar orden logico del rango,
  - normalizar vacios a undefined.
- El store persiste historyFilters junto con datos de pagina y total.
- registerSale refresca historial reutilizando filtros activos actuales.

### 3) Proteccion contra race conditions

Archivo:

- src/interface/store/salesStore.ts

Comportamiento aplicado:

- Se agrega latestHistoryRequestId.
- Cada fetch de historial incrementa requestId.
- Si una respuesta llega fuera de orden, se ignora y no pisa estado mas reciente.

Resultado:

- Se evita que una respuesta vieja reemplace datos actuales cuando el usuario aplica filtros o navega rapido entre paginas.

### 4) Contrato de repositorio extendido

Archivo:

- src/core/repositories/SaleRepository.ts

Cambios relevantes:

- Se agrega SaleListFilters con campos opcionales:
  - fromISO
  - toISO
- listPaginated se extiende para aceptar filters opcionales.

## Integracion end-to-end

### 5) Renderer repository (Electron)

Archivo:

- src/interface/dev/ElectronSaleRepository.ts

Comportamiento aplicado:

- listPaginated envia page, pageSize y filters por IPC.

### 6) API bridge y tipos del renderer

Archivos:

- src/electron/preload.ts
- src/electron.d.ts

Cambios relevantes:

- Se agrega SaleListFiltersJSON.
- saleListPaginated acepta filters opcionales en la API expuesta.

### 7) IPC en proceso main

Archivo:

- src/electron/ipcHandlers.ts

Cambios relevantes:

- sale:listPaginated recibe filters opcionales.
- Se normalizan y validan filtros en main:
  - formato de fecha valido,
  - rango cronologicamente correcto.
- Se delega a saleRepository.listPaginated con filtros normalizados.

### 8) Persistencia con filtros y total consistente

Archivos:

- src/infrastructure/persistence/PrismaSaleRepository.ts
- src/interface/dev/InMemorySaleRepository.ts

Comportamiento aplicado:

- PrismaSaleRepository:
  - Construye where por created_at con limites:
    - fromISO usando gte
    - toISO usando lt
  - Aplica el mismo where en findMany y count.
  - Mantiene sort por created_at desc.
- InMemorySaleRepository:
  - Aplica fromISO/toISO en memoria con la misma logica.
  - Retorna total del conjunto filtrado.
  - Mantiene orden descendente por fecha.

## Flujo de uso

1. Usuario define desde y/o hasta en la pantalla de Ventas.
2. UI valida entradas locales.
3. UI llama fetchSalesHistory en pagina 1 con filtros.
4. Store normaliza filtros y lanza consulta paginada.
5. Repositorio consulta ventas de la pagina y total filtrado.
6. UI muestra tabla, rango y total en contexto del filtro.
7. Al usar Anterior/Siguiente, se mantiene el mismo filtro.

## Reglas funcionales consolidadas

- Un unico endpoint paginado para historial con filtros: sale:listPaginated.
- Total y paginas siempre se calculan sobre resultados filtrados.
- Cambio de filtro implica volver a pagina 1.
- Rango temporal con semantica:
  - desde inclusivo
  - hasta exclusivo

## Como probar

1. Levantar la app en modo Electron.
2. Ir a pantalla de Ventas.
3. Aplicar solo fecha/hora desde y validar resultados.
4. Aplicar solo fecha/hora hasta y validar resultados.
5. Aplicar ambos extremos y validar rango.
6. Intentar rango invalido (desde >= hasta) y validar mensaje.
7. Navegar con Anterior/Siguiente con filtros activos.
8. Limpiar filtros y validar retorno a listado global paginado.
9. Confirmar que total y paginas cambian segun el filtro aplicado.

## Archivos impactados

- src/interface/pages/SalesPage.tsx
- src/interface/store/salesStore.ts
- src/interface/hooks/useSales.ts
- src/core/repositories/SaleRepository.ts
- src/interface/dev/ElectronSaleRepository.ts
- src/interface/dev/InMemorySaleRepository.ts
- src/electron/preload.ts
- src/electron.d.ts
- src/electron/ipcHandlers.ts
- src/infrastructure/persistence/PrismaSaleRepository.ts

## Notas tecnicas

- Los valores datetime-local se convierten a ISO antes de enviarse.
- Se mantiene compatibilidad con paginacion ya existente.
- Fecha del reporte: 2026-04-19.
