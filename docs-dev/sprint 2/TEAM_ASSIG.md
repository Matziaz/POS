# Roles y Responsabilidades del Equipo (Sprint 2)

Este documento define quien es responsable de cada area tecnica del proyecto y como se coordina el equipo durante el sprint 2.

---

## Estructura del Equipo

### Diego - Tech Lead y Responsable de Interface (foco principal)

**Responsabilidades de liderazgo tecnico:**
- Definir direccion tecnica de la capa de interface
- Priorizar decisiones de arquitectura de frontend
- Validar estandares de calidad y consistencia en UI
- Guiar implementaciones y desbloquear decisiones tecnicas

**Responsabilidades tecnicas:**
- Desarrollo de la capa de interface (React)
- Componentes reutilizables y paginas
- Gestion del estado global de la aplicacion
- Integracion con servicios del core
- Consolidar la interface completa para cierre de sprint

**Areas del codigo:**
- `src/interface/components/` — Componentes React
- `src/interface/pages/` — Pantallas de la aplicacion
- `src/interface/hooks/` — Custom hooks
- `src/interface/store/` — Estado global (Zustand)

---

### Fer - Scrum Master

**Responsabilidades de proceso:**
- Facilitar standups diarios
- Remover impedimentos del equipo
- Coordinar sprint planning, review y retrospectiva
- Dar seguimiento a compromisos del sprint y riesgos

**Responsabilidades de coordinacion tecnica:**
- Alinear dependencias entre interface, core e infrastructure
- Asegurar que las historias esten bien definidas antes de desarrollo
- Dar visibilidad de bloqueos y cambios de prioridad

---

### Alfredo - Apoyo tecnico transversal (prioridad: interface)

**Responsabilidades tecnicas:**
- Apoyar a Diego en implementacion de interface
- Tomar tareas complementarias de frontend para acelerar entregas
- Resolver ajustes de integracion con core/infrastructure cuando sea necesario
- Cubrir tareas tecnicas adicionales del sprint segun prioridad del equipo

**Areas del codigo (segun necesidad):**
- `src/interface/components/` — Apoyo en componentes
- `src/interface/pages/` — Apoyo en pantallas y flujos
- `src/interface/hooks/` — Apoyo en logica de consumo
- `src/infrastructure/` — Ajustes puntuales de integracion
- `src/core/` — Ajustes menores necesarios para habilitar la UI

---

## Flujo de Trabajo

### Enfoque de ejecucion para Sprint 2

1. **Diego lidera la implementacion de interface** y define prioridades tecnicas de frontend.
2. **Alfredo apoya la ejecucion de interface** tomando tareas paralelas y desbloqueando integraciones.
3. **Fer coordina el proceso del sprint** para mantener ritmo, foco y cumplimiento de objetivos.

Este enfoque prioriza completar la interface de punta a punta durante el sprint 2.

### Comunicacion entre areas

- **Diego y Alfredo:** Coordinacion diaria de tareas de interface y reparticion por prioridad.
- **Fer y Diego:** Seguimiento de avance, riesgos y definicion de alcance del sprint.
- **Fer y Alfredo:** Monitoreo de bloqueos operativos y ajustes de capacidad.

### Code reviews

- **Diego revisa:** Cambios criticos en `interface/` y decisiones tecnicas de frontend.
- **Alfredo revisa:** Cambios de soporte en `interface/` e integraciones puntuales.
- **Fer valida:** Que los cambios cumplan objetivos del sprint y criterios de historia.

---

## Prioridades del Sprint 2

- Completar la interface funcional de los flujos principales.
- Reducir bloqueos entre capas con apoyo transversal.
- Mantener velocidad de entrega con coordinacion diaria.

---

## Documentacion de referencia

- **Arquitectura general:** `docs/decisiones-arquitectura.md`
- **Convenciones de codigo:** `docs-dev/guides/DEVELOPMENT.md`
- **Vision del producto:** `docs/vision.md`
- **Plan de desarrollo:** `docs/roadmap.md`