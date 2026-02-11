# Roadmap de Desarrollo - POS Adaptable

## Visión Operativa del Roadmap

El roadmap busca construir un POS funcional, adaptable y escalable, priorizando:

- Incrementos usables desde el Sprint 1
- Baja complejidad inicial
- Decisiones técnicas diferidas hasta tener evidencia real
- Arquitectura preparada para extensión (no sobreingeniería)

**Principio rector:** Cada sprint debe cerrar con un producto que podría usarse en un comercio real, aunque sea de forma limitada.

---

## Sprint 1 – Core del POS

**Duración:** 2 semanas  
**Objetivo:** Contar con un POS mínimo funcional que permita registrar ventas y persistirlas localmente en una Raspberry Pi.

### Alcance Funcional del Sprint

Al finalizar el sprint, el sistema debe permitir:

- Crear productos
- Registrar una venta
- Guardar la información localmente
- Ejecutarse de forma estable en una Raspberry Pi

### Historias de Usuario (Sprint 1)

#### HU1 – Registro de productos

**Como** comerciante  
**Quiero** dar de alta productos  
**Para** poder venderlos en el sistema

**Criterios de aceptación:**
- Producto con al menos: nombre, precio y SKU interno
- No permite productos sin precio
- Persisten después de reiniciar el sistema

#### HU2 – Registro de ventas

**Como** comerciante  
**Quiero** registrar una venta  
**Para** llevar control de mis ingresos

**Criterios de aceptación:**
- Se pueden agregar uno o más productos
- Se calcula el total de la venta
- La venta queda almacenada localmente

#### HU3 – Persistencia local

**Como** sistema  
**Quiero** guardar la información localmente  
**Para** funcionar sin internet

**Criterios de aceptación:**
- Los datos sobreviven reinicios
- No depende de servicios externos

### Tareas Técnicas Detalladas (Sprint 1)

#### 1. Estructura base del proyecto

- Definir estructura de carpetas (core, dominio, persistencia, interfaz)
- Separar lógica de negocio de la interfaz
- Crear configuración mínima de arranque
- Definir convenciones internas (nombres, formatos)

**Resultado esperado:** Proyecto entendible para cualquier desarrollador del equipo.

#### 2. Modelo de dominio inicial

- Definir entidad `Producto`
- Definir entidad `Venta`
- Definir relación venta-productos
- Definir identificadores únicos internos

**Resultado esperado:** Dominio claro, sin lógica de infraestructura mezclada.

#### 3. Persistencia local básica

- Seleccionar mecanismo local simple (archivo o base local)
- Implementar guardado y lectura de productos
- Implementar guardado y lectura de ventas
- Manejo básico de errores de escritura/lectura

**Resultado esperado:** Datos confiables sin pérdida accidental.

#### 4. Lógica de registro de ventas

- Crear servicio de creación de venta
- Validar existencia de productos
- Calcular total automáticamente
- Guardar venta al finalizar

**Resultado esperado:** Venta consistente y correctamente almacenada.

#### 5. Interfaz mínima de operación

- Interfaz simple (CLI o UI básica, sin diseño)
- Alta de productos
- Registro de una venta
- Confirmación visual del registro

**Resultado esperado:** Sistema operable aunque no sea "bonito".

#### 6. Despliegue en Raspberry Pi

- Preparar entorno de ejecución
- Documentar pasos mínimos de despliegue
- Verificar funcionamiento estable
- Medir uso básico de recursos

**Resultado esperado:** El POS corre de forma continua en la Raspberry Pi.

### Incremento del Sprint 1

**POS mínimo funcional capaz de registrar productos y ventas, con persistencia local, ejecutándose en Raspberry Pi.**

---

## Sprint 2 – Configuración y Control Básico

**Duración:** 2 semanas  
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

- **Sprint 1 es fundacional:** evitar agregar "features bonitas"
- **Sprint 2 introduce valor operativo real**
- **Toda decisión técnica debe responder a:** ¿Esto aporta valor al comerciante hoy?

---

## Próximos Sprints (Pendientes de Planeación)

Los siguientes sprints abordarán:

- Sprint 3: Pagos y métodos de cobro
- Sprint 4: Reportes y analítica básica
- Sprint 5: Sincronización y respaldo
- Sprint 6: Optimizaciones y extensiones por contexto
