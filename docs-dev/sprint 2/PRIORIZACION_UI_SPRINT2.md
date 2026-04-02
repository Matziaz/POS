# Priorización de Interfaces a Mejorar (UI Focus Sprint 2)

Fecha: 26 marzo 2026  
Contexto: Decisión de equipo de centrar esfuerzo en UI. Este documento prioriza qué pantallas mejorar primero con mayor impacto visual y operativo.

## Estado actual de componentes disponibles

Ya tenemos:
- UI base: button, dialog, input, label, table, badge, alert-dialog.
- Estructuras de página activas: Inventario y Ventas (simples).
- Flujos funcionales: crear/editar/borrar productos, registrar ventas.

Faltante de mayoría: experiencia visual pulida, navegación completa, componentes especializados (KPI cards, tablas avanzadas, teclado numérico, etc).

## Top 3 Interfaces a mejorar ya (impacto máximo, semana 1)

### 1. Terminal de Venta (prioridad crítica)

**Por qué es prioritario:**
- Es la interfaz operativa más usada en un POS.
- el mockup muestra layout completo: grid de productos por categoría + sidebar derecho con ticket.
- Actualmente solo existe un modal simple en Ventas.

**Estado actual:**
- SaleForm.tsx es un modal básico con tabla de líneas.
- No hay grid de productos ni categorización.
- No hay indicador visual de ticket/carrito lateral.

**Mejora propuesta (fase 1):**
- Convertir Ventas a layout dedicado POS con:
  - Panel izquierdo: grid de productos por categoría (productos recientes, bebidas, botanas, etc).
  - Panel derecho: ticket activo con líneas de venta + total.
  - Acciones rápidas: búsqueda de producto, escaneo de código, descuento.

**Esfuerzo estimado:** 3-4 días (Diego + Alfredo paralelo en componentes).

---

### 2. Dashboard (panel de control)

**Por qué es prioritario:**
- Es lo primero que ve el usuario al abrir el app (impacto visual inmediato).
- El mockup muestra resumen ejecutivo: ganancia total, inventario, acciones rápidas, gráfico de ventas.
- Actualmente no existe como página principal.

**Estado actual:**
- No hay dashboard, la app arranca directo en Inventario.
- El mockup muestra: 4-5 tarjetas KPI grandes (ganancia, transacciones, promociones, margen) + gráfico.

**Mejora propuesta (fase 1):**
- Crear pantalla Dashboard con:
  - Tarjetas KPI: ganancia total, ventas hoy, tickets, invntario crítico.
  - Resumen de ventas por período (gráfico simple).
  - Acciones rápidas: nueva venta, nuevo producto.
  - Alertas: inventario bajo, etc.

**Esfuerzo estimado:** 2-3 días (Diego lidera, Alfredo componentes KPI).

---

### 3. Flujo de Cobro (Checkout)

**Por qué es prioritario:**
- Es el final del flujo operativo, muy visible en mockup.
- Requiere UX especial: métodos de pago + teclado numérico.
- Hoy no existe como pantalla; es solo cálculo de total en SaleForm.

**Estado actual:**
- SaleForm calcula total pero no hay selección de método de pago.
- No hay teclado numérico, no hay manejo de cambio.

**Mejora propuesta (fase 1):**
- Crear modal/pantalla Checkout con:
  - Total a cobrar resaltado.
  - Botones de métodos: Efectivo, Tarjeta, Transferencia, Vales.
  - Teclado numérico para capturar monto recibido.
  - Cálculo de cambio automático.
  - Confirmación final.

**Esfuerzo estimado:** 2-3 días (Alfredo lidera, Diego review).

---

## Tier 2 Interfaces (semana 2 o paralelizable con tier 1)

### 4. Inventario Avanzado

**Mejora propuesta:**
- Tabla mejorada con: búsqueda + filtros por categoría + indicadores visuales (stock bajo en rojo).
- Acciones inline: ver detalle, editar, marcar para reorden.
- Agregar botón "Reabastecimiento rápido".

**Esfuerzo estimado:** 2 días (Alfredo).

---

### 5. Formulario de Producto Mejorado

**Mejora propuesta:**
- Agregar upload de foto (con preview).
- Selector de categoría mejorado.
- Campos adicionales: proveedor, costo unitario (para margen).
- Preview de etiqueta/código de barras.

**Esfuerzo estimado:** 2-3 días (Alfredo).

---

## Tier 3 Interfaces (si hay capacidad, semana 2 final)

- Reportes: gráficos, exportación a Excel.
- Directorio: contactos y proveedores.
- Perfil y Configuración: ajustes del negocio.

---

## Componentes nuevos que necesitamos crear (bloques reutilizables)

Para poder mejorar las interfaces, primero crearemos componentes base reusables:

1. **KPICard** - tarjeta con número grande, label e icono.
2. **CategoryPill** - botón de categoría (beverage, food, etc).
3. **ProductGrid** - grid de productos con imagen/nombre/precio.
4. **TicketSummary** - resumen de líneas de venta (tabla compacta).
5. **NumericKeypad** - teclado 1-9, 0, backspace, confirm.
6. **PaymentMethodSelector** - botones de métodos de pago.
7. **SearchBar** - búsqueda con filtros.
8. **StockBadge** - indicador visual de nivel de inventario.

---

## Roadmap semanal recomendado

**Lunes-Miércoles (Semana 1):**
1. Lunes: Crear componentes base (KPICard, CategoryPill, ProductGrid).
2. Martes-Miércoles: Implementar Dashboard + avance en Terminal de Venta.

**Jueves-Viernes (Semana 1 + lunes semana 2):**
1. Terminal de Venta (completar).
2. Flujo de Cobro.

**Semana 2:**
1. Inventario avanzado.
2. Formulario de producto.
3. Reportes (si hay tiempo).

---

## Regla de "Done" para cada interfaz mejorada

Checklist de aceptación de UI por pantalla:

- [ ] Ruta navegable en app desde navbar.
- [ ] Layout visual coincide con mockup (80%+ fidelidad).
- [ ] Componentes son reutilizables (no inline styles).
- [ ] Responsive en desktop (prioridad) y tablet.
- [ ] Sin regresiones en pantallas ya existentes.
- [ ] Captura o video demoeable en daily.

---

## Conclusión

Enfoque de UI Sprint 2 es: **Terminal de Venta → Dashboard → Flujo de Cobro** como tier 1 prioritario.

Con esto resuelto y componentes base creados, el resto de pantallas (Inventario avanzado, Reportes, Directorio) caen más rápido porque reutilizan bloques.

