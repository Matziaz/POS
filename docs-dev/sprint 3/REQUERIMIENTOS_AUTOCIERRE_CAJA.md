# Requerimientos para Automatizar el Corte de Caja

Fecha: 15 abril 2026  
Sprint: 3  
Tema: Autocierre de caja configurable (HU8 evolución)

## 1. Objetivo
Definir lo necesario para que el sistema genere cortes de caja automáticos en una hora configurada, con trazabilidad, idempotencia y visibilidad operativa.

## 2. Alcance
Incluye:
- Configuración de autocierre desde Admin.
- Ejecución automática en proceso de aplicación.
- Persistencia auditable del evento de cierre.
- Monitoreo de estado (última y próxima ejecución).

No incluye en este entregable:
- Exportaciones PDF/Excel.
- Integraciones externas de notificación (correo/WhatsApp).

## 3. Requerimientos para BD

### 3.1 Configuración de autocierre
Crear una estructura persistente para almacenar configuración del scheduler.

Campos mínimos:
- id
- enabled (0/1)
- close_time (formato HH:mm)
- timezone (ejemplo: America/Mexico_City)
- grace_minutes (tolerancia en minutos)
- created_by_user_id (opcional)
- updated_at

### 3.2 Reglas de integridad para cierres
Agregar protección contra duplicados de cierre final.

Requerido:
- Constraint único por combinación:
  - business_date
  - cash_register_id
  - is_final

Objetivo:
- Evitar dobles cortes por carreras o reintentos del scheduler.

### 3.3 Auditoría de origen de cierre
Registrar metadatos para saber cómo se creó cada cierre.

Campos recomendados en cash_closure:
- source (manual | auto)
- triggered_at
- scheduler_run_id
- created_by_user_id

### 3.4 Registro de ejecuciones del scheduler
Crear bitácora de ejecuciones automáticas.

Tabla recomendada: cash_closure_job_run
Campos sugeridos:
- id
- started_at
- finished_at
- status (success | failed | skipped)
- business_date
- cash_register_id
- closure_id (nullable)
- error_message (nullable)
- attempt

### 3.5 Definición de día operativo
Documentar y persistir la regla oficial para calcular business_date.

Se debe definir:
- zona horaria oficial
- criterio de corte de día
- comportamiento en horario de verano

## 4. Requerimientos para Frontend

### 4.1 Pantalla de configuración en Admin
Agregar sección de autocierre con:
- Toggle activar/desactivar.
- Campo hora de autocierre.
- Selector/valor de zona horaria.
- Campo tolerancia (grace_minutes).
- Botón Guardar configuración.

### 4.2 Controles operativos
Agregar acciones visibles:
- Ejecutar cierre ahora.
- Reintentar último cierre fallido.

### 4.3 Estado operativo en UI
Mostrar:
- Última ejecución (hora, estado, mensaje).
- Próxima ejecución programada.
- Folio del último corte generado automáticamente.

### 4.4 Historial de cortes
En la vista de cortes incluir:
- Folio
- Fecha de negocio
- Total
- Cantidad de ventas
- Origen (manual/auto)
- Estado
- Fecha/hora de ejecución

### 4.5 UX de seguridad
Aplicar guardrails:
- Confirmación al cambiar hora cuando autocierre está activo.
- Bloqueo de edición si hay ejecución en curso.
- Mensajes claros de fallo con acción recomendada.

## 5. Requerimientos de ejecución automática (Scheduler)

### 5.1 Ubicación de ejecución
Implementar scheduler dentro del proceso main de Electron.

Motivo:
- Evita dependencia de cron del sistema operativo.
- Mantiene comportamiento homogéneo en equipos de desarrollo/producción.

### 5.2 Frecuencia de evaluación
- Tick sugerido: cada 1 minuto.
- Si no está habilitado: no ejecutar cierre.

### 5.3 Reglas de disparo
- Ejecutar cuando la hora actual alcance close_time en timezone configurada.
- Aplicar tolerancia de gracia para recuperar ejecuciones retrasadas.
- Si ya existe cierre final para business_date + caja: marcar como skipped (idempotente).

### 5.4 Reintentos
Definir política explícita:
- Número máximo de reintentos.
- Backoff entre intentos.
- Condición de stop y escalamiento.

## 6. Decisiones obligatorias a cerrar entre BD y Frontend
1. ¿Se permite autocierre sin ventas?
2. ¿Se cierra también la caja o solo se genera corte?
3. ¿Cómo se comporta el sistema si hay más de una caja abierta?
4. ¿Qué timezone aplica por defecto?
5. ¿Qué mensaje y acción verá el usuario cuando falle el autocierre?

## 7. Criterios de aceptación
Se considera listo cuando:
- Existe configuración persistente de autocierre.
- El sistema ejecuta cierre automático a la hora configurada.
- No se generan cierres duplicados ante doble disparo.
- Se registra auditoría completa (source, run, errores).
- Admin permite configurar, consultar estado y reintentar.
- Historial muestra origen manual/auto y estado.

## 8. Checklist para planning técnico

### BD
- [ ] Diseñar y crear tabla de configuración de autocierre.
- [ ] Agregar constraint anti-duplicado en cierre final.
- [ ] Definir esquema de bitácora de ejecución.
- [ ] Documentar regla de business_date.

### Frontend
- [ ] Crear sección de autocierre en Admin.
- [ ] Mostrar última/próxima ejecución.
- [ ] Exponer botón de ejecución manual y reintento.
- [ ] Adaptar historial con origen y estado.

### Integración
- [ ] Implementar scheduler en main process.
- [ ] Reutilizar servicio de cierre existente (sin lógica duplicada).
- [ ] Agregar manejo de errores y estados skipped/failed.
- [ ] Probar escenarios de carrera e idempotencia.

## 9. Riesgos y mitigaciones
- Riesgo: dobles cierres por concurrencia.
  - Mitigación: constraint único + chequeo idempotente.
- Riesgo: cierre en timezone incorrecta.
  - Mitigación: timezone explícita en configuración y logs.
- Riesgo: falta de visibilidad ante fallo silencioso.
  - Mitigación: bitácora de ejecución + estado en Admin.

## 10. Próximo paso sugerido
1. Cerrar decisiones funcionales con BD y Frontend.
2. Aprobar contrato de datos (configuración, auditoría, estados).
3. Ejecutar implementación en 2 PR:
   - PR A: BD + repositorios + scheduler base.
   - PR B: UI Admin + observabilidad + flujo de reintento.
