# Decisiones de Arquitectura

Documento actualizado al estado real del proyecto, con foco en lo que el equipo ya implementó.

## 1) Principios adoptados

- Separación por capas para reducir acoplamiento: `core`, `domain`, `infrastructure`, `interface`, `shared`.
- Lógica de negocio aislada de la UI y de la persistencia.
- Evolución incremental: primero flujos funcionales, luego integración de infraestructura real.
- Simplicidad operativa como criterio principal de diseño.

## 2) Arquitectura actual implementada

### Estructura por capas

- `src/core/`: entidades, servicios, errores y contratos de repositorio.
- `src/domain/`: reglas y contextos de dominio.
- `src/infrastructure/`: base para persistencia y configuración (incluye Prisma/SQLite en preparación).
- `src/interface/`: pantallas, componentes, hooks y stores de la aplicación.
- `src/shared/`: tipos, constantes y utilidades transversales.

### Estado funcional actual

- Interfaz de Inventario operativa con CRUD de productos.
- Interfaz de Ventas operativa con historial y detalle por venta.
- Navegación entre módulos con enrutamiento en frontend.
- Integración de la interfaz con servicios y entidades de `core`.

## 3) Stack tecnológico actual

### Frontend

- React + TypeScript sobre Vite.
- Tailwind CSS para estilos.
- Componentes UI base en `src/interface/components/ui/`.
- Zustand para manejo de estado (`productStore`, `salesStore`).
- React Router (`HashRouter`) para navegación entre pantallas.

### Dominio y aplicación

- Entidades de negocio: `Product`, `Sale`, `SaleItem`, `InventoryMovement`.
- Servicios de negocio: `ProductService`, `SaleService`.
- Contratos de persistencia definidos en repositorios de `core`.

### Persistencia

- Prisma schema y estructura de `infrastructure/database` existentes.
- En el estado actual de ejecución de la interfaz, se usan repositorios en memoria en `src/interface/dev/` para validar flujos.
- La integración completa con persistencia SQLite/Prisma está pendiente de cierre.

## 4) Decisiones técnicas clave tomadas

1. Definir contratos de repositorio en `core` antes de acoplar infraestructura.
2. Implementar primero flujos de UI y casos de uso para validar experiencia de operación.
3. Usar repositorios en memoria como estrategia temporal de desarrollo e integración.
4. Mantener la interfaz desacoplada de implementaciones concretas de base de datos.

## 5) Estado de alcance (real vs pendiente)

### Ya realizado

- Base arquitectónica por capas.
- Módulos funcionales de Inventario y Ventas en la capa `interface`.
- Integración de UI con servicios de negocio del `core`.

### Pendiente

- Conectar repositorios de `infrastructure` en lugar de repositorios en memoria.
- Completar funcionalidades operativas del Sprint 2 (configuración de comercio, inventario con reglas completas y corte de caja diario).

## 6) Decisiones descartadas por ahora

No se consideran parte del estado actual implementado:

- Empaquetado de escritorio con Electron.
- Integraciones de IA para recomendaciones automáticas.
- Envío automatizado por WhatsApp.
- Integración de hardware POS.

Estas líneas pueden evaluarse en etapas posteriores, pero no forman parte del entregable funcional actual.