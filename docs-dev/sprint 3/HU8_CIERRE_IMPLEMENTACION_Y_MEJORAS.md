# HU8 - Corte de caja diario formal

Fecha de actualización: 12 abril 2026
Sprint: 3

## 1. Objetivo de HU8
Implementar un corte de caja diario formal para que, al final de jornada, se pueda:
- Generar un resumen de total vendido.
- Registrar cuántas ventas hubo.
- Guardar el corte con un identificador (folio) para trazabilidad.

## 2. Qué se implementó

### 2.1 Servicio de negocio para cierre
Se implementó un servicio dedicado en core:
- src/core/services/CashClosureService.ts

Responsabilidades actuales del servicio:
- Validar que exista una caja abierta antes de cerrar.
- Calcular rango de cierre usando apertura de caja y fecha/hora de cierre.
- Obtener ventas del rango y filtrar por la caja abierta.
- Calcular:
  - cantidad de ventas (salesCount)
  - total vendido (totalAmount)
- Generar folio de cierre con formato base:
  - CC-YYYYMMDD-XXXXXXXX
- Persistir cierre en cash_closure.
- Persistir desglose por método de pago en cash_closure_payment_breakdown.
- Cambiar estado de caja abierta a closed al completar el cierre.

### 2.2 Persistencia y esquema ya disponible
El esquema actual ya cuenta con tablas para HU8:
- prisma/schema.prisma

Tablas relevantes:
- cash_register
- cash_closure
- cash_closure_payment_breakdown
- sale (relacionada a cash_register)
- sale_payment
- payment_methods

### 2.3 Integración IPC (main <-> renderer)
Se agregaron handlers para operar cortes desde frontend:
- src/electron/ipcHandlers.ts

Canales agregados:
- cashClosure:close
- cashClosure:listByDateRange

### 2.4 Exposición en preload y tipados
Se agregaron contratos para cierre en:
- src/electron/preload.ts
- src/electron.d.ts

APIs nuevas:
- cashClosureClose(...)
- cashClosureListByDateRange(...)

### 2.5 Pantalla operativa mínima de HU8
Se agregó una pantalla base de cierre:
- src/interface/pages/CashClosurePage.tsx

Capacidades actuales:
- Generar corte manual.
- Capturar fecha de negocio y notas.
- Mostrar folio generado.
- Mostrar desglose del último cierre por método de pago.
- Consultar historial de cortes de los últimos 30 días.

Navegación:
- Ruta agregada en src/App.tsx: /caja/cierre
- Menú agregado en src/interface/components/layout/SideBarData.tsx

### 2.6 Ajustes de compatibilidad con HU9
Para mantener consistencia de caja + pagos:
- Se envía cashRegisterId explícito al registrar ventas en terminal.
- Se propagó opciones de registro en useSales/salesStore.
- Se reforzó validación de pagos en SaleService:
  - al menos un pago
  - suma de pagos igual al total
  - regla básica para efectivo (tendered >= amount)

Archivos relevantes:
- src/interface/pages/SalesTerminalPage.tsx
- src/interface/hooks/useSales.ts
- src/interface/store/salesStore.ts
- src/core/services/SaleService.ts
- src/interface/pages/SalesPage.tsx

## 3. Validación realizada
Se agregaron y ejecutaron tests unitarios de servicio:
- src/core/services/__tests__/cashClosureService.test.ts

Cobertura del test actual:
- Cierre exitoso con folio y breakdown.
- Error cuando no hay caja abierta.

## 4. Estado actual (resumen ejecutivo)
HU8 quedó en estado funcional base:
- Ya se puede generar corte formal manual.
- Ya queda persistido con folio y desglose.
- Ya existe historial de cortes.

Lo pendiente principal no es el núcleo de cierre, sino automatización y robustez operativa.

## 5. Mejoras futuras acordadas

### 5.1 Automatización por horario (autocierre)
Objetivo:
- Ejecutar corte automáticamente a una hora configurable.

Propuesta técnica:
- Implementar scheduler en proceso main de Electron (no cron del SO).
- Ejecutar validación periódica y disparar closeDaily cuando corresponda.
- Configurable desde Admin.

### 5.2 Configuración desde Admin
Agregar una sección de configuración de autocierre con:
- activar/desactivar autocierre
- hora objetivo (HH:mm)
- zona horaria
- ejecutar cierre ahora (manual)

### 5.3 Persistencia de configuración de scheduler
Actualmente la configuración global está orientada a retailContext.
Se propone:
- nueva tabla/config para autocierre
- repositorio/servicio separado para no mezclar con AppConfiguration actual

### 5.4 Idempotencia y protección anti-duplicado
Agregar reglas para evitar cierres repetidos:
- un cierre final por fecha de negocio y caja
- constraint único en BD para reforzar integridad

### 5.5 Revisión de concurrencia
Definir y manejar caso de doble ejecución simultánea de cierre:
- bloqueo lógico o validación transaccional
- respuesta clara para usuario en caso de carrera

### 5.6 Mejoras de testing
Agregar tests para:
- fecha de cierre inválida (antes de apertura)
- caja ya cerrada
- ventas sin pagos asociados
- idempotencia de cierre

### 5.7 Mejoras de UX/UI
- Mostrar detalle de breakdown por cada cierre del historial (no solo último).
- Filtros por fecha/folio en pantalla de corte.
- Exportar reporte de cierre (PDF/CSV) si negocio lo requiere.

## 6. Coordinación recomendada con BD
Temas a cerrar con responsable de BD antes de automatización:
- diseño final de tabla de configuración de autocierre
- índices/constraints para evitar duplicados
- definición de fecha de negocio y zona horaria
- estrategia de auditoría (campos created_by, source auto/manual, etc.)

## 7. Próximo paso sugerido
Implementar MVP de autocierre configurable:
1. Migración BD para configuración de autocierre.
2. Repositorio y servicio de configuración.
3. Scheduler en main process.
4. UI de configuración en Admin.
5. Validaciones + pruebas de integración.
