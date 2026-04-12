# Roles y Responsabilidades del Equipo (Sprint 3)

**Fecha:** 6 de abril de 2026  
**Sprint:** 3 — Configuración de Comercio y Corte de Caja  
**Nuevo integrante:** Ana (Desarrolladora)

---

## Estructura del Equipo

### Fer - Scrum Master

**Responsabilidades de proceso:**
- Facilitar standups diarios
- Remover impedimentos del equipo
- Coordinar sprint planning, review y retrospectiva
- Dar seguimiento a compromisos del sprint y riesgos
- Gestionar cambios de alcance o prioridades

**Responsabilidades de coordinación técnica:**
- Alinear dependencias entre capas (interfaz, core, infraestructura)
- Asegurar que las historias estén bien definidas antes de desarrollo
- Dar visibilidad de bloqueos y cambios de prioridad
- Facilitar comunicación entre Alfredo, Diego y Ana

---

### Alfredo - Tech Lead

**Responsabilidades de liderazgo técnico:**
- Definir dirección técnica del sprint (arquitectura, decisiones clave)
- Priorizar decisiones de implementación
- Validar estándares de calidad y consistencia en código
- Mentorear a Diego y Ana en decisiones técnicas

**Responsabilidades técnicas:**
- Implementar HU7 (Configuración inicial del comercio)
- Implementar HU10 (RetailContext)
- Code reviews de cambios críticos
- Definir migraciones Prisma necesarias
- Consolidar integraciones entre servicios

**Áreas del código:**
- `src/domain/contextos/` — Implementación de RetailContext
- `src/infrastructure/persistence/` — Repositorios y migraciones
- `src/core/services/` — Servicios de configuración
- `src/interface/dev/` — Factory de servicios actualizado

---

### Diego - Desarrollador

**Responsabilidades técnicas:**
- Implementar HU8 (Corte de caja diario)
- Crear entidad CashRegister en dominio
- Implementar repositorio y servicios asociados
- Pantalla/modal de cierre de caja
- Validaciones de cierre diario

**Áreas del código:**
- `src/core/entities/CashRegister.ts` — Nueva entidad
- `src/core/services/CashRegisterService.ts` — Lógica de negocio
- `src/infrastructure/persistence/PrismaCashRegisterRepository.ts` — Persistencia
- `src/interface/components/cashier/` — Componentes de UI para cierre
- `src/interface/pages/CashierPage.tsx` — Página de administración de cortes

---

### Ana - Desarrolladora (Nueva)

**Responsabilidades técnicas:**
- Implementar HU9 (Métodos de pago)
- Actualizar entidad Sale con campo paymentMethod
- Modificar flujo de checkout para selección de método
- Validaciones y cálculo de cambio en efectivo
- Persistencia de método de pago

**Áreas del código:**
- `src/core/entities/Sale.ts` — Agregar paymentMethod
- `src/core/services/SaleService.ts` — Validaciones de pago
- `src/interface/components/sales/terminal/` — Actualizaciones de checkout
- `src/interface/pages/SalesTerminalPage.tsx` — Integración de métodos

**Onboarding:**
- Sesión con Alfredo sobre arquitectura del proyecto (1 hora)
- Pair programming con Diego en primeras tareas (día 1-2)
- Revisión de convenciones de código en DEVELOPMENT.md

---

## Flujo de Trabajo

### Enfoque de ejecución para Sprint 3

1. **Alfredo lidera decisiones técnicas** y mentoriza implementaciones.
2. **Diego implementa lógica de corte de caja** (HU8).
3. **Ana implementa métodos de pago** (HU9) con soporte de Diego.
4. **Alfredo ejecuta configuración y contextos** (HU7 y HU10) en paralelo.
5. **Fer coordina el proceso** para mantener ritmo y desbloqueos.

### Comunicación entre áreas

- **Alfredo y Diego/Ana:** Sincronización diaria de decisiones técnicas y bloqueos.
- **Fer y Alfredo:** Seguimiento de avance, riesgos y alcance del sprint.
- **Fer y Diego/Ana:** Monitoreo de capacidad y ajustes operativos.
- **Todo el equipo:** Standup diario (15 min) + review/retrospectiva de sprint.

### Code reviews

- **Alfredo revisa:** Cambios en contextos, migraciones, servicios core.
- **Diego revisa:** Cambios en interfaz de corte de caja.
- **Ana revisa:** Cambios en checkout y métodos de pago (con apoyo de Diego).
- **Fer valida:** Que los cambios cumplan objetivos del sprint y HU.

---

## Prioridades del Sprint 3

1. **HU7** (Configuración inicial) — Bloqueante para contextos.
2. **HU8** (Corte de caja) — Operación diaria del comerciante.
3. **HU9** (Métodos de pago) — Completitud del flujo de venta.
4. **HU10** (RetailContext) — Base para adaptabilidad futura.

---

## Estado Técnico Actual (12 abril 2026)

### HU9 (Métodos de pago)
- Flujo de checkout ya envía pagos estructurados (`paymentMethodId`, `amount`, `tendered`, `changeDue`).
- Venta ya se guarda asociada a caja (`cashRegisterId`) y se persisten pagos en `sale_payment`.
- Se agregaron repositorios e IPC para `salePayment`.

### HU8 (Corte de caja)
- Ya existen tablas en schema para cierre formal:
	- `cash_closure`
	- `cash_closure_payment_breakdown`
	- `cash_register`
- Se implementó servicio de cierre diario en core (`CashClosureService`) con:
	- generación de folio
	- cálculo de ventas y total
	- breakdown por método de pago
	- cierre de caja abierta (`status: closed`)
- Se agregaron endpoints IPC para cierre y consulta por rango:
	- `cashClosure:close`
	- `cashClosure:listByDateRange`
- Se habilitó pantalla mínima operativa de cierre en ruta `/caja/cierre`.

### Validación
- Tests unitarios de `CashClosureService` agregados y pasando.

---

## Definición de Done (Sprint 3)

Checklist para cada historia:

- [ ] Ruta navigable en app desde navbar/menu.
- [ ] Pantalla/flujo funcional en estado normal.
- [ ] Persistencia real en SQLite verificada.
- [ ] Tests unitarios en core/services.
- [ ] Code review aprobado por responsable
- [ ] Docs actualizadas en DEVELOPMENT.md
- [ ] Captura o video demoeable en daily
- [ ] Sin regresiones en pantallas ya existentes

---

## Documentación de referencia

- **Arquitectura general:** `docs/decisiones-arquitectura.md`
- **Convenciones de código:** `docs-dev/guides/DEVELOPMENT.md`
- **Guía de Prisma:** `docs-dev/guides/PRISMA_GUIDE.md`
- **Pendientes de Sprint 2:** `docs-dev/sprint 2/SPRINT2_CIERRE_SUMMARY.md`

---

## Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Ana es nueva en el proyecto | Alto | Onboarding de 1h + pair programming día 1-2 |
| Dependencias entre HU7, HU8, HU9 | Medio | Alfredo define contratos temprano, paralelización en dev |
| Cambios en Prisma schema | Medio | Fer valida antes, aplica migraciones en dev.sh |
| Cambios en SaleService pueden afectar varias áreas | Alto | Code review estricto, tests antes de cambio |

---

## Métricas de seguimiento

- **Burndown:** Seguimiento diario de HU avanzado vs. planeado.
- **Test coverage:** Mantener >80% en tests unitarios de services.
- **Cycle time:** Promedio de días de HU desde start a done.
- **Code quality:** Sin deuda técnica crítica al cerrar sprint.

---

## Próximo sprint (Sprint 4)

**Tema:** Reportes avanzados y analítica.

**Roles tentativa:**  
- Fer: Scrum Master (continúa)
- Alfredo: Tech Lead (continúa)
- Diego: Desarrollador (continúa, mentoriza Ana)
- Ana: Desarrolladora (continúa)
