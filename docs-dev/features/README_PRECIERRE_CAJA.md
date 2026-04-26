# Estado de Implementacion: Pre-cierre + Cierre de Caja

## Resumen Ejecutivo

Se implemento una automatizacion segura y progresiva para el flujo de caja:

1. Pre-cierre automatico con hora configurable (default 23:45).
2. Confirmacion humana obligatoria para cerrar.
3. Sin cierre forzado si hay ventas activas.

Esta implementacion entrega valor inmediato (menos olvidos de cierre) sin introducir riesgos operativos altos.

## Objetivo

Reducir cierres omitidos y estandarizar el proceso diario de caja, manteniendo control humano y trazabilidad.

## Alcance implementado

Incluye:

1. Scheduler en Electron para detectar ventana de pre-cierre (23:45).
2. Aviso en UI cuando exista caja abierta.
3. Confirmacion manual desde la pantalla de cierre.
4. Reutilizacion de la logica actual de cierre diario.
5. Configuracion persistente de horario de recordatorio y hora de corte desde Admin.

No incluye:

1. Cierre 100% automatico sin confirmacion.
2. Bloqueo forzado de nuevas ventas.
3. Idempotencia fuerte en BD para cierre diario.

## Decision de Estrategia

Se evaluaron tres opciones:

1. Pre-cierre automatico.
2. Propuesta automatica de cierre.
3. Cierre programable automatico.

Decision ejecutada:

1. Pre-cierre automatico + confirmacion humana.

Razon:

1. Menor riesgo tecnico y operativo.
2. Encaja con la arquitectura actual (Electron + IPC + servicio de dominio existente).
3. Permite evolucionar en siguientes sprints sin rehacer trabajo.

## Flujo Funcional Implementado

1. El proceso main de Electron revisa la hora local cada 10 segundos.
2. Si se alcanza la hora de recordatorio configurada y existe caja abierta, emite evento de pre-cierre a renderer.
3. La UI muestra aviso global de recordatorio y mantiene accion de confirmacion de cierre manual.
4. El usuario confirma cierre manualmente.
5. Se ejecuta el cierre diario con la logica actual.
6. Se muestra resultado y se refresca historial.

## Reglas Operativas

1. El aviso de pre-cierre no cierra la caja por si solo.
2. El cierre siempre requiere accion explicita de usuario.
3. Si hay ventas activas en curso, solo se avisa y se espera confirmacion.
4. El flujo manual de cierre se conserva como fallback.

## Integracion Tecnica (Archivos)

Archivos base de la implementacion:

1. src/core/services/CashClosureService.ts
2. src/core/entities/CashRegister.ts
3. src/electron/ipcHandlers.ts
4. src/electron/preload.ts
5. src/electron.d.ts
6. src/interface/pages/CashClosurePage.tsx
7. src/interface/dev/serviceFactory.ts

## Plan Tecnico por Fases

### Estado fase 1: Contrato de integracion

1. Definir evento IPC de advertencia de pre-cierre (main -> renderer).
2. Exponer API de escucha en preload y tiparla en electron.d.ts.

### Estado fase 2: Scheduler seguro

1. Timer implementado cada 10 segundos en main.
2. Emitir advertencia una vez por fecha de negocio.
3. No emitir si no hay caja abierta.

### Estado fase 3: UI de confirmacion

1. Escuchar evento de pre-cierre en App para mostrar aviso global y sincronizar pendiente.
2. Mantener boton de confirmacion de cierre manual en pantalla de corte.
3. Reusar cashClosureClose existente.
4. Bloquear doble confirmacion mientras procesa.

### Estado fase 4: Validacion

1. Probar flujo con caja abierta y sin caja abierta.
2. Probar confirmacion exitosa y con error.
3. Verificar no duplicar cierre por clic repetido.

## Criterios de Aceptacion

1. En la hora de recordatorio configurada (default 23:45), con caja abierta, la UI muestra aviso de pre-cierre.
2. Con caja cerrada, no se muestra aviso.
3. El cierre manual confirmado genera corte valido (folio, total, historial).
4. Si ocurre error al cerrar, la UI informa sin bloquear pantalla.
5. La interfaz evita ejecuciones duplicadas por doble clic.

## Riesgos y Mitigacion

1. Riesgo: advertencia no atendida.
   Mitigacion: mantener boton de cierre manual visible y reutilizable.

2. Riesgo: cierre duplicado por interaccion.
   Mitigacion: deshabilitar accion mientras se ejecuta solicitud.

3. Riesgo: horario mal configurado por operacion.
   Mitigacion: mantener configuracion editable desde Admin con validacion HH:mm.

## Evolucion Recomendada (Siguiente Sprint)

1. Agregar idempotencia fuerte a nivel de persistencia.
2. Definir politica de zona horaria por negocio/sucursal.
3. Evaluar cierre programable completo con auditoria reforzada.
4. Mejorar trazabilidad de eventos de scheduler (ultima/proxima corrida, reintentos).

## Estado

Estado actual:

1. Implementada de forma incremental con configuracion persistente y aviso global.
2. Prioridad: alta.
3. Enfoque: seguridad operativa primero, automatizacion total despues.
