# Walkthrough Completo: Flujo Actual de Venta y Checkout

## 1) Objetivo del walkthrough
Este documento te ayuda a explicar de forma clara el flujo actual de venta y checkout a una nueva integrante del equipo.

Cubre:
- Flujo funcional (lo que hace el usuario en pantalla).
- Flujo tecnico (que capas de codigo participan en cada paso).
- Reglas de negocio y validaciones reales implementadas hoy.
- Casos borde y errores comunes.
- Guion sugerido para una sesion de walkthrough en vivo.
- Checklist de pruebas manuales para validar que todo sigue funcionando.

## 2) Vista general del flujo (resumen rapido)
Ruta principal:
- App route: /ventas/terminal
- Pantalla: src/interface/pages/SalesTerminalPage.tsx

Secuencia resumida:
1. Cajero agrega productos al ticket.
2. Ajusta cantidades en el resumen lateral (TicketSummary).
3. Presiona "Proceder al pago".
4. Se abre CheckoutModal.
5. Selecciona metodo (hoy solo efectivo esta habilitado visualmente).
6. Ingresa monto recibido en CashPayment.
7. Confirma pago.
8. Se llama registerSale() -> SaleService.registerSale().
9. Se descuenta stock y se registran movimientos de inventario OUT.
10. Se persiste la venta en repositorio (Electron IPC -> Prisma en main process).
11. UI limpia ticket y refresca productos.

## 3) Mapa de arquitectura por capas

### Capa UI (React)
- src/interface/pages/SalesTerminalPage.tsx
- src/interface/components/sales/terminal/ProductGrid.tsx
- src/interface/components/sales/terminal/ProductCard.tsx
- src/interface/components/sales/terminal/TicketSummary.tsx
- src/interface/components/sales/terminal/CheckoutModal.tsx
- src/interface/components/sales/terminal/PaymentMethodSelector.tsx
- src/interface/components/sales/terminal/CashPayment.tsx

Responsabilidad:
- Renderizar catalogo, ticket y checkout.
- Capturar interaccion de usuario.
- Mostrar estados de carga/error.

### Capa estado UI (Zustand)
- src/interface/store/saleSessionStore.ts
- src/interface/store/salesStore.ts
- src/interface/hooks/useSales.ts

Responsabilidad:
- saleSessionStore: ticket en construccion (lineas, qty, clear).
- salesStore: listado historico + accion registerSale.
- useSales: wrapper del store con carga inicial automatica.

### Capa de servicios de dominio
- src/core/services/SaleService.ts

Responsabilidad:
- Validar lineas de venta.
- Verificar existencia de producto y stock.
- Crear entidad Sale y SaleItem.
- Descontar inventario.
- Registrar InventoryMovement tipo OUT.
- Persistir venta.

### Capa repositorio + adaptadores
- src/interface/dev/serviceFactory.ts
- src/interface/dev/ElectronSaleRepository.ts
- src/infrastructure/persistence/PrismaSaleRepository.ts

Responsabilidad:
- Seleccionar implementacion de repos (Electron vs InMemory).
- Traducir entidades <-> JSON IPC.
- Persistir en SQLite via Prisma (main process).

### Capa Electron IPC
- src/electron/preload.ts
- src/electron/ipcHandlers.ts

Responsabilidad:
- Exponer API segura window.electronAPI al renderer.
- Resolver canales sale:list, sale:save, sale:findById, etc.

### Capa de datos
- prisma/schema.prisma

Tablas clave:
- sale
- sale_item
- inventory_movement
- product

## 4) Flujo funcional detallado (pantalla por pantalla)

### Paso A: Entrar a terminal de ventas
Entrada por ruta:
- src/App.tsx registra /ventas/terminal -> SalesTerminalPage.

Al montar SalesTerminalPage:
- useProducts() carga productos.
- useSales() dispara fetchSales() para mantener historial en store.
- Se consulta productTypeList por IPC para tabs de categorias.

### Paso B: Buscar y filtrar productos
- SearchBar filtra por nombre + SKU (normalizado a minusculas).
- CategoryTabs filtra por category name -> typeId usando mapa categoryIdByName.
- ProductGrid renderiza solo productos filtrados.
- ProductCard deshabilita "Agregar" si stock <= 0.

### Paso C: Construir ticket en session store
Store:
- src/interface/store/saleSessionStore.ts

Reglas importantes:
- addProduct:
  - Si stock <= 0, no agrega.
  - Si SKU ya existe en ticket, incrementa qty hasta stock maximo.
- incrementQty:
  - Nunca supera stock del producto.
- decrementQty:
  - Si qty llega a 0, elimina la linea.
- removeLine:
  - Elimina linea por SKU.
- clear:
  - Limpia todo el ticket.

### Paso D: Revisar ticket y abrir checkout
Componente:
- src/interface/components/sales/terminal/TicketSummary.tsx

Comportamiento:
- Calcula total items y total importe.
- Boton "Proceder al pago" solo habilitado con lineas y sin submit en progreso.
- Boton "Vaciar" limpia ticket.

En SalesTerminalPage.handleCheckout:
- Si no hay lineas, no hace nada.
- Guarda total en estado local.
- Abre CheckoutModal.

### Paso E: CheckoutModal y seleccion de metodo
Componente:
- src/interface/components/sales/terminal/CheckoutModal.tsx

Comportamiento:
- Muestra total a pagar.
- Presenta PaymentMethodSelector con 4 opciones visuales:
  - cash, card, transfer, voucher
- Estado actual real:
  - Solo "cash" esta habilitado (las demas opciones estan disabled).

### Paso F: Cobro en efectivo (CashPayment)
Componente:
- src/interface/components/sales/terminal/CashPayment.tsx

Reglas de UI:
- Monto recibido editable por input + teclado numerico.
- Maximo de decimales: DECIMAL_PLACES.
- Calcula cambio: max(0, amountReceived - total).
- Confirmar pago solo si amountReceived >= total.

Nota importante:
- amountReceived solo valida UX de caja.
- Actualmente no se persiste en DB ni en entidad Sale.

### Paso G: Confirmar pago y registrar venta
En SalesTerminalPage.handleConfirmPayment:
- Llama registerSale(lines.map(productSku, qty)).
- Cierra modal si ok.
- Limpia ticket (clearSession()).
- Refresca productos (refetchProducts()) para mostrar stock actualizado.
- Si falla, muestra checkoutError en banner.

## 5) Flujo tecnico de registro de venta (end-to-end)

Secuencia de llamadas real:
1. SalesTerminalPage -> useSales.registerSale(lines).
2. useSales -> salesStore.registerSale(lines).
3. salesStore.registerSale -> getSaleService().registerSale({ lines }).
4. serviceFactory entrega SaleService con repos Electron en entorno Electron.
5. SaleService.registerSale valida y arma sale.
6. SaleService actualiza stock en ProductRepository.
7. SaleService guarda InventoryMovement OUT por cada linea.
8. SaleService persiste Sale en SaleRepository.
9. ElectronSaleRepository -> window.electronAPI.saleSave(sale.toJSON()).
10. preload usa ipcRenderer.invoke("sale:save", data).
11. ipcHandlers rehidrata Sale.create(...) y llama PrismaSaleRepository.save(...).
12. Prisma inserta en sale y sale_item.
13. Vuelve al renderer; salesStore hace fetchSales() y actualiza historial.

## 6) Reglas de negocio y validaciones actuales

Implementadas en SaleService.registerSale:
- Debe existir al menos una linea.
- Cada linea debe tener qty entero positivo.
- Cada SKU debe existir.
- Debe haber stock suficiente por producto.
- Si no llega userId, usa DEFAULT_USER_ID.
- Precio se toma como snapshot al momento de venta (price del producto al registrar).
- Se descuenta stock por cada linea.
- Se crea movimiento de inventario OUT por cada linea.

Implementadas en entidades:
- Sale.create:
  - id obligatorio.
  - userId obligatorio.
  - items no vacio.
  - total calculado como suma de lineTotal.
- SaleItem.create:
  - id/saleId/productId obligatorios.
  - quantity entero positivo.
  - price numero positivo.

Implementadas en UI/session:
- Ticket nunca permite qty > stock.
- Boton checkout deshabilitado sin lineas.
- En efectivo, monto recibido debe cubrir total para confirmar.

## 7) Persistencia y modelo de datos
Tablas involucradas en checkout:
- sale: cabecera de venta (id, user_id, total, created_at).
- sale_item: lineas de ticket (product_id, qty, price snapshot).
- inventory_movement: trazabilidad de salida de stock.

Puntos clave:
- No existe columna payment_method en sale actualmente.
- No existe columna amount_received ni change.
- El metodo de pago es, por ahora, UX parcial en frontend.

## 8) Manejo de errores

Errores posibles y donde aparecen:
- "Product with SKU ... not found"
- "Line quantity must be a positive integer"
- "Not enough stock for product ..."
- Falla en IPC o DB al guardar

Superficie de error visible:
- Banner de error en SalesTerminalPage (productsError/salesError/checkoutError/productTypeError).
- salesStore tambien guarda error para vistas de historial.

## 9) Limitaciones actuales y deuda tecnica relevante
1. Payment methods no estan persistidos en dominio/DB.
2. Solo efectivo esta habilitado para cierre de venta real.
3. amountReceived/cambio no se guardan en ninguna capa de datos.
4. SaleService no recibe metodo de pago (firma actual solo lines + optional userId).
5. Checkout no genera folio fiscal ni integracion de caja/corte.

## 10) Guion sugerido para tu walkthrough en vivo (30-45 min)

### Bloque 1 (5 min): Contexto rapido
- Mostrar ruta /ventas/terminal.
- Explicar objetivo: convertir seleccion de productos en venta persistida con impacto en stock.

### Bloque 2 (10 min): UX operativa
- Agregar 2-3 productos.
- Subir/bajar cantidades.
- Mostrar comportamiento sin stock.
- Abrir checkout y validar monto insuficiente/suficiente.

### Bloque 3 (10 min): Traza tecnica
- Ir desde SalesTerminalPage hasta SaleService.
- Mostrar que pasa por salesStore, serviceFactory, Electron repositories, IPC handlers y Prisma.
- Confirmar en codigo donde se descuenta stock y donde se crean movimientos OUT.

### Bloque 4 (10 min): Riesgos y backlog
- Explicar que metodos de pago son UX parcial.
- Definir extension natural: paymentMethod en entidad, migracion Prisma, ajuste de IPC y reportes.

### Bloque 5 (5-10 min): Preguntas de ownership
- Que parte tomara ella primero (UI checkout, servicio, persistencia o pruebas).
- Que PR pequeño puede abrir como primer deliverable.

## 11) Checklist de pruebas manuales (para pair session)

### Ticket y stock
- [ ] Agregar producto con stock > 0.
- [ ] Intentar agregar producto sin stock (debe bloquear).
- [ ] Incrementar cantidad hasta limite de stock (no debe sobrepasar).
- [ ] Decrementar hasta remover linea.
- [ ] Vaciar ticket.

### Checkout
- [ ] Abrir checkout con ticket no vacio.
- [ ] Verificar que solo "cash" este habilitado.
- [ ] Ingresar monto menor al total (no debe confirmar).
- [ ] Ingresar monto exacto (confirma, cambio 0).
- [ ] Ingresar monto mayor (confirma, cambio correcto).

### Persistencia
- [ ] Tras confirmar, ticket queda limpio.
- [ ] Stock se refleja actualizado al volver al grid.
- [ ] Venta aparece en /ventas (historial).
- [ ] Detalle de venta muestra lineas y total esperado.

### Errores
- [ ] Simular error de registro (si posible) y validar banner de error.
- [ ] Cerrar error con boton "Cerrar" y confirmar limpieza de estado.

## 12) Referencias de codigo (indice rapido)
- src/App.tsx
- src/interface/pages/SalesTerminalPage.tsx
- src/interface/components/sales/terminal/TicketSummary.tsx
- src/interface/components/sales/terminal/CheckoutModal.tsx
- src/interface/components/sales/terminal/PaymentMethodSelector.tsx
- src/interface/components/sales/terminal/CashPayment.tsx
- src/interface/store/saleSessionStore.ts
- src/interface/store/salesStore.ts
- src/interface/hooks/useSales.ts
- src/interface/dev/serviceFactory.ts
- src/core/services/SaleService.ts
- src/core/entities/Sale.ts
- src/core/entities/SaleItem.ts
- src/interface/dev/ElectronSaleRepository.ts
- src/electron/preload.ts
- src/electron/ipcHandlers.ts
- src/infrastructure/persistence/PrismaSaleRepository.ts
- prisma/schema.prisma

## 13) Propuesta de siguiente paso (si quieren extender checkout)
Orden recomendado para agregar metodos de pago reales:
1. Extender modelo de dominio Sale (paymentMethod, amountReceived, change).
2. Agregar migracion Prisma para sale.
3. Ajustar contrato IPC (preload + d.ts + ipcHandlers).
4. Ajustar SaleService.registerSale para validar por metodo.
5. Actualizar reportes y detalle de venta.
6. Agregar pruebas unitarias y de integracion del nuevo flujo.
