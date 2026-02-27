# Roadmap de Desarrollo - POS Adaptable

## Visión Operativa del Roadmap

El roadmap busca construir un POS funcional, adaptable y escalable, priorizando:

- Incrementos usables desde el Sprint 1
- Baja complejidad inicial
- Decisiones técnicas diferidas hasta tener evidencia real
- Arquitectura preparada para extensión (no sobreingeniería)

**Principio rector:** Cada sprint debe cerrar con un producto que podría usarse en un comercio real, aunque sea de forma limitada.

---

## Sprint 1 – Core del POS (COMPLETADO)

**Duración:** 2 semanas (Finalizado)  
**Estado:** Completado parcialmente - requiere sprint de cierre  
**Objetivo:** Contar con un POS mínimo funcional que permita registrar ventas y persistirlas localmente en una Raspberry Pi.

### Logros del Sprint 1

**Infraestructura y Persistencia:**
- Base de datos SQLite configurada y funcional
- Prisma ORM integrado con migraciones aplicadas
- Cliente Prisma implementado en capa de infraestructura
- SQLiteProductRepository implementado y funcional
- Documentación técnica completa (PRISMA_GUIDE.md)

**Capa de Interfaz:**
- Pantalla de Inventario con CRUD completo de productos
- Pantalla de Ventas con historial y detalle
- Navegación global con React Router
- Componentes UI base (shadcn/ui) implementados
- Stores con Zustand (productStore, salesStore)
- Hooks personalizados (useProducts, useSales)

**Core y Dominio:**
- Entidades completas (Product, Sale, SaleItem, InventoryMovement, User, Role, Provider)
- Servicios de negocio (ProductService, SaleService)
- Repositorios contractuales definidos
- Sistema de errores de dominio
- Tests unitarios con Vitest

### Pendientes del Sprint 1 (Bloqueantes)

- Conectar stores/hooks del front a persistencia real (Prisma/SQLite)
- Implementar SQLiteSaleRepository en infraestructura
- Validación end-to-end de persistencia real desde UI
- Reemplazar repositorios en memoria por implementaciones reales

### Alcance Funcional Original

Al finalizar el sprint, el sistema debe permitir:

- Crear productos (COMPLETADO - UI funcional, persistencia pendiente)
- Registrar una venta (COMPLETADO - UI funcional, persistencia pendiente)
- Guardar la información localmente (PARCIAL - DB lista, integración pendiente)
- Ejecutarse de forma estable en una Raspberry Pi (NO INICIADO)

### Historias de Usuario (Sprint 1)

#### HU1 – Registro de productos (PARCIAL)

**Como** comerciante  
**Quiero** dar de alta productos  
**Para** poder venderlos en el sistema

**Criterios de aceptación:**
- Producto con al menos: nombre, precio y SKU interno (CUMPLIDO)
- No permite productos sin precio (CUMPLIDO)
- Persisten después de reiniciar el sistema (PENDIENTE - Sprint 1.5)

**Estado:** UI implementada, validaciones funcionando, falta conexión con DB real.

#### HU2 – Registro de ventas (PARCIAL)

**Como** comerciante  
**Quiero** registrar una venta  
**Para** llevar control de mis ingresos

**Criterios de aceptación:**
- Se pueden agregar uno o más productos (CUMPLIDO)
- Se calcula el total de la venta (CUMPLIDO)
- La venta queda almacenada localmente (PENDIENTE - Sprint 1.5)

**Estado:** UI implementada, cálculos funcionando, falta persistencia en DB real.

#### HU3 – Persistencia local (PENDIENTE)

**Como** sistema  
**Quiero** guardar la información localmente  
**Para** funcionar sin internet

**Criterios de aceptación:**
- Los datos sobreviven reinicios (PENDIENTE - Sprint 1.5)
- No depende de servicios externos (CUMPLIDO)

**Estado:** Infraestructura lista, falta integración end-to-end.

### Tareas Técnicas Detalladas (Sprint 1)

#### 1. Estructura base del proyecto (COMPLETADO)

- Definir estructura de carpetas (core, dominio, persistencia, interfaz) (CUMPLIDO)
- Separar lógica de negocio de la interfaz (CUMPLIDO)
- Crear configuración mínima de arranque (CUMPLIDO)
- Definir convenciones internas (nombres, formatos) (CUMPLIDO)

**Resultado alcanzado:** Proyecto entendible con separación clara de capas.

#### 2. Modelo de dominio inicial (COMPLETADO)

- Definir entidad `Producto` (CUMPLIDO)
- Definir entidad `Venta` (CUMPLIDO)
- Definir relación venta-productos (CUMPLIDO)
- Definir identificadores únicos internos (CUMPLIDO)

**Resultado alcanzado:** Dominio completo con entidades, servicios y tests.

#### 3. Persistencia local básica (PARCIAL)

- Seleccionar mecanismo local simple (archivo o base local) (CUMPLIDO - SQLite)
- Implementar guardado y lectura de productos (CUMPLIDO - SQLiteProductRepository)
- Implementar guardado y lectura de ventas (PENDIENTE - SQLiteSaleRepository)
- Manejo básico de errores de escritura/lectura (CUMPLIDO)

**Resultado alcanzado:** Infraestructura de persistencia lista, falta repositorio de ventas.

#### 4. Lógica de registro de ventas (COMPLETADO)

- Crear servicio de creación de venta (CUMPLIDO - SaleService)
- Validar existencia de productos (CUMPLIDO)
- Calcular total automáticamente (CUMPLIDO)
- Guardar venta al finalizar (CUMPLIDO - en memoria, falta DB real)

**Resultado alcanzado:** Lógica de negocio completa y testeada.

#### 5. Interfaz mínima de operación (COMPLETADO)

- Interfaz simple (CLI o UI básica, sin diseño) (SUPERADO - UI completa con shadcn/ui)
- Alta de productos (CUMPLIDO)
- Registro de una venta (CUMPLIDO)
- Confirmación visual del registro (CUMPLIDO)

**Resultado alcanzado:** UI funcional y profesional, supera expectativas iniciales.

#### 6. Despliegue en Raspberry Pi (NO INICIADO)

- Preparar entorno de ejecución (PENDIENTE)
- Documentar pasos mínimos de despliegue (PENDIENTE)
- Verificar funcionamiento estable (PENDIENTE)
- Medir uso básico de recursos (PENDIENTE)

**Resultado esperado:** Se abordará después de cerrar integración en Sprint 1.5.

### Incremento del Sprint 1

**Progreso:** Infraestructura de persistencia establecida y capa de interfaz funcional, pero desconectadas. Requiere sprint de integración.

---

## Sprint 1.5 – Integración y Cierre del Core (URGENTE)

**Duración:** 1 semana  
**Objetivo:** Conectar las capas de interfaz e infraestructura para cerrar el ciclo completo de persistencia real.

### Alcance Crítico

Este mini-sprint cierra los pendientes bloqueantes del Sprint 1 antes de avanzar a nuevas funcionalidades.

### Tareas Críticas

#### 1. Implementar SQLiteSaleRepository

- Crear `src/infrastructure/persistence/SQLiteSaleRepository.ts`
- Implementar métodos: `save()`, `findById()`, `list()`
- Incluir guardado de SaleItems relacionados
- Probar inserción y lectura manual con tsx

**Resultado esperado:** Repositorio de ventas funcional con Prisma.

#### 2. Conectar stores del front a repositorios reales

- Modificar `src/interface/dev/serviceFactory.ts` para usar SQLiteProductRepository y SQLiteSaleRepository
- Eliminar dependencias de InMemoryProductRepository e InMemorySaleRepository
- Actualizar imports en productStore y salesStore

**Resultado esperado:** Stores consumen persistencia real, no datos en memoria.

#### 3. Validación end-to-end de persistencia

- Crear producto desde UI y verificar en base de datos pos.db
- Editar y eliminar producto desde UI y verificar cambios persistidos
- Registrar venta desde UI y verificar en tabla Sales y SaleItems
- Verificar que datos sobreviven reinicio de aplicación

**Resultado esperado:** Flujo completo funcional desde UI hasta DB.

#### 4. Pruebas de integración básicas

- Documentar casos de prueba ejecutados manualmente
- Crear checklist de validación funcional
- Registrar evidencia de funcionamiento (capturas o logs)

**Resultado esperado:** Confianza en la integridad del sistema.

#### 5. Preparación para despliegue en Raspberry Pi (Opcional)

- Documentar dependencias del sistema operativo
- Crear script de instalación básico
- Validar funcionamiento en entorno similar a producción

**Resultado esperado:** Sistema listo para despliegue si el tiempo lo permite.

### Incremento del Sprint 1.5

**POS completamente funcional con persistencia real integrada, listo para registrar productos y ventas en base de datos SQLite desde la interfaz de usuario.**

---

## Sprint 2 – Configuración y Control Básico (PENDIENTE)

**Duración:** 2 semanas  
**Estado:** No iniciado - depende de Sprint 1.5  
**Objetivo:** Adaptar el POS al tipo de comercio y generar control operativo básico.

### Alcance Funcional del Sprint

Al finalizar el sprint, el sistema debe:

- Configurarse según tipo de negocio
- Manejar inventario simple
- Generar corte de caja diario

### Historias de Usuario (Sprint 2)

#### HU4 – Configuración inicial del comercio

**Como** comerciante  
**Quiero** configurar mi tipo de negocio  
**Para** que el sistema se adapte a mi operación

**Criterios de aceptación:**
- Configuración inicial obligatoria
- Persistente
- No se solicita en cada arranque

#### HU5 – Gestión básica de inventario

**Como** comerciante  
**Quiero** llevar control simple de inventario  
**Para** saber qué productos tengo

**Criterios de aceptación:**
- Stock inicial configurable
- Descuento automático al vender
- No permite vender sin stock (configurable)

#### HU6 – Corte de caja diario

**Como** comerciante  
**Quiero** ver un resumen diario  
**Para** saber cuánto vendí

**Criterios de aceptación:**
- Total vendido del día
- Número de ventas
- Persistencia histórica

### Tareas Técnicas Detalladas (Sprint 2)

#### 1. Sistema de configuración inicial

- Definir estructura de configuración del comercio
- Guardar tipo de negocio
- Guardar preferencias básicas (ej. control de stock)
- Validar que exista configuración al arrancar

**Resultado esperado:** Sistema consciente del contexto del comercio.

#### 2. Implementación de Contextos (RetailContext)

- Crear contexto base de negocio
- Implementar `RetailContext`
- Permitir extender en el futuro (sin implementarlos aún)
- Asociar reglas básicas al contexto

**Resultado esperado:** Base sólida para comportamiento específico por negocio.

#### 3. Inventario simple

- Agregar atributo `stock` a producto
- Inicialización de stock
- Actualización automática al vender
- Manejo de stock negativo (regla configurable)

**Resultado esperado:** Control realista sin complejidad excesiva.

#### 4. Corte de caja

- Agrupar ventas por día
- Calcular totales diarios
- Generar resumen legible
- Guardar histórico de cortes

**Resultado esperado:** Información operativa clara para el comerciante.

#### 5. Ajustes en interfaz

- Mostrar información de stock
- Mostrar resumen del día
- Flujo claro de cierre diario

**Resultado esperado:** Uso natural sin capacitación formal.

### Incremento del Sprint 2

**POS configurable por tipo de comercio, con inventario básico y corte de caja diario funcional.**

---

## Notas para Planeación del Scrum Team

### Estado Actual del Proyecto

**Sprint 1:** Completado parcialmente. Se construyeron las capas por separado (infraestructura y UI) pero no están integradas.

**Acción inmediata:** Ejecutar Sprint 1.5 (1 semana) para cerrar la integración antes de iniciar Sprint 2.

### Principios de Desarrollo

- **Sprint 1.5 es crítico:** No agregar features nuevas hasta cerrar la integración
- **Sprint 2 arranca cuando:** Toda la persistencia real esté funcionando end-to-end
- **Toda decisión técnica debe responder a:** ¿Esto aporta valor al comerciante hoy?
- **Evitar sobreingeniería:** Implementar solo lo necesario para el incremento actual

---

## Próximos Sprints (Pendientes de Planeación)

Los siguientes sprints abordarán:

- Sprint 1.5: Integración y cierre del core (EN CURSO - 1 semana)
- Sprint 2: Configuración y control básico (Pendiente - 2 semanas)
- Sprint 3: Pagos y métodos de cobro
- Sprint 4: Reportes y analítica básica
- Sprint 5: Sincronización y respaldo
- Sprint 6: Optimizaciones y extensiones por contexto
