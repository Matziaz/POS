# Roles y Responsabilidades del Equipo

Este documento define quien es responsable de cada area tecnica del proyecto y como se coordina el equipo.

---

## Estructura del Equipo

### Diego - Scrum Master y Desarrollo de Interface

**Responsabilidades de proceso:**
- Facilitar standups diarios
- Remover impedimentos del equipo
- Coordinar sprint planning y retrospectivas

**Responsabilidades tecnicas:**
- Desarrollo de la capa de interface (React)
- Componentes reutilizables y paginas
- Gestion del estado global de la aplicacion
- Integracion con los servicios del core

**Areas del codigo:**
- `src/interface/components/` — Componentes React
- `src/interface/pages/` — Pantallas de la aplicacion
- `src/interface/hooks/` — Custom hooks
- `src/interface/store/` — Estado global (Zustand)

---

### Fer - Tech Lead y Desarrollo de Core

**Responsabilidades de liderazgo:**
- Decisiones de arquitectura
- Validacion de cambios que afectan multiples capas
- Mentoria tecnica del equipo
- Code reviews de cambios arquitectonicos

**Responsabilidades tecnicas:**
- Logica de negocio pura (sin dependencias de UI o BD)
- Definicion de entidades y servicios
- Interfaces de repositorios
- Reglas de dominio especificas por tipo de comercio

**Areas del codigo:**
- `src/core/entities/` — Entidades del dominio
- `src/core/services/` — Servicios de negocio
- `src/core/repositories/` — Interfaces de acceso a datos
- `src/core/errors/` — Errores personalizados
- `src/domain/contextos/` — Contextos de negocio
- `src/domain/rules/` — Reglas de validacion
- `src/shared/` — Tipos, constantes y utilidades compartidas

---

### Alfredo - Desarrollo de Infrastructure

**Responsabilidades tecnicas:**
- Configuracion y mantenimiento de la base de datos
- Implementacion de los repositorios definidos en core
- Integracion con hardware (impresoras, escaneres)
- Configuracion del entorno de la aplicacion

**Areas del codigo:**
- `src/infrastructure/database/` — Configuracion de SQLite y Prisma
- `src/infrastructure/persistence/` — Implementaciones de repositorios
- `src/infrastructure/config/` — Variables de entorno y configuracion
- `src/infrastructure/hardware/` — Integracion con perifericos

---

## Flujo de Trabajo

### Orden de desarrollo recomendado

1. **Fer define las interfaces** en `core/` (entidades, servicios, repositorios)
2. **Alfredo implementa la persistencia** en `infrastructure/` basandose en las interfaces
3. **Diego consume los servicios** desde `interface/` para construir la UI

Este orden minimiza el retrabajo porque los contratos se definen primero.

### Comunicacion entre areas

- **Fer y Alfredo:** Coordinan las interfaces de repositorios antes de que Alfredo empiece la implementacion
- **Fer y Diego:** Coordinan que servicios expone el core y como se consumen desde la UI
- **Diego y Alfredo:** Coordinan configuracion y variables de entorno necesarias para el frontend

### Code reviews

Cada desarrollador revisa cambios dentro de su area de responsabilidad:

- **Fer revisa:** Cambios en `core/`, `domain/` y `shared/`. Tambien valida cambios arquitectonicos que afecten multiples capas.
- **Diego revisa:** Cambios en `interface/`. Valida que la UI sea clara y funcional.
- **Alfredo revisa:** Cambios en `infrastructure/`. Valida que la persistencia sea correcta y eficiente.

---

## Reglas de integracion

### Interface no importa directamente de Infrastructure

Incorrecto:
```typescript
import { DatabaseService } from '@infrastructure/database'
```

Correcto:
```typescript
import { ProductRepository } from '@core/repositories'
```

La capa de interface solo debe comunicarse con core. Infrastructure implementa las interfaces definidas en core, pero interface no debe conocer esos detalles.

### Core no debe conocer detalles de implementacion

El codigo en `core/` no puede importar nada de `infrastructure/` ni de `interface/`. Debe ser completamente independiente para poder testearlo de forma aislada.

---

## Documentacion de referencia

- **Arquitectura general:** `docs/decisiones-arquitectura.md`
- **Convenciones de codigo:** `docs-dev/guides/DEVELOPMENT.md`
- **Vision del producto:** `docs/vision.md`
- **Plan de desarrollo:** `docs/roadmap.md`