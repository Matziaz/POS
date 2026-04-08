# Onboarding — Ana (Desarrolladora Sprint 3)

Rol: Desarrolladora
Historia de usuario principal: HU9 (Métodos de pago)
Duración de onboarding: 2 días

## 1. Contexto del proyecto

### Qué es el POS

- Objetivo: Sistema de punto de venta funcional, escalable y adaptable a diferentes tipos de comercios.
- Stack actual: React + TypeScript (frontend), Node.js + Electron (desktop), SQLite + Prisma (persistencia).
- Equipo: Fer (Scrum Master), Alfredo (Tech Lead), Diego (Desarrollador), tú (Desarrolladora).

### Sprints completados

- Sprint 1: Core del POS (entidades, persistencia, interfaz base).
- Sprint 2: UI operativa (Dashboard, Terminal de Venta, Reportes, Inventario con stock).

### Tu rol en Sprint 3

Implementarás HU9 — Métodos de pago, que permite a los vendedores seleccionar efectivo, tarjeta o transferencia en el checkout y validar cambio.

## 2. Plan de onboarding

### Día 1

#### Sesión con Alfredo (Tech Lead) — 1 hora

- Temas: arquitectura, decisiones técnicas, flujo de mensajería entre componentes.
- Qué preguntar: convenciones, estructura de servicios, integración con IPC de Electron.

#### Exploración de código base — 1 hora

- src/core/entities/Sale.ts → entidad actual.
- src/core/services/SaleService.ts → lógica de ventas.
- src/interface/pages/SalesTerminalPage.tsx → flujo actual.

#### Pair programming con Diego — 2 horas

- Diego te muestra el checkout actual (CheckoutModal).
- Primer commit: agregar campo paymentMethod a la entidad Sale.
- Actualizar la interfaz del checkout con los botones de método.

### Día 2

#### Testing y validaciones — 1.5 horas

- Unit test para validación de cambio (efectivo).
- Integración con IPC si es necesario.

#### Review y ajustes — 1 hora

- Alfredo revisa el código.
- Ajustes finales.

#### Documentación — 30 min

- Actualizar docs-dev/guides/DEVELOPMENT.md.

## 3. Estructura de carpetas clave

```text
src/
├── core/
│   ├── entities/
│   │   └── Sale.ts                    <- Aquí irá paymentMethod
│   ├── services/
│   │   └── SaleService.ts             <- Validaciones de pago
│   └── repositories/
│       └── SaleRepository.ts
├── interface/
│   ├── components/
│   │   └── sales/
│   │       └── terminal/
│   │           ├── CheckoutModal.tsx  <- Tú operarás aquí
│   │           └── PaymentMethodSelector.tsx (posible componente nuevo)
│   ├── pages/
│   │   └── SalesTerminalPage.tsx
│   └── store/
│       └── saleSessionStore.ts
└── electron/
    └── ipcHandlers.ts                 <- Si necesitas registrar nuevos handlers
```

## 4. Flujo actual de venta

- Usuario agrega productos en Terminal (SalesTerminalPage).
- Hace click en Checkout → abre CheckoutModal.
- CheckoutModal muestra total y botón Confirmar Pago.
- Al confirmar → registerSale() persiste la venta.

### Lo que vas a cambiar

- Agregar selección de método de pago en el modal.
- Guardar el método seleccionado en la venta (paymentMethod).
- Si es Efectivo, validar monto recibido y calcular cambio.

## 5. Tareas (HU9)

### Tarea 1: Agregar campo paymentMethod a Sale

src/core/entities/Sale.ts

```text
typescriptexport interface SaleProps {
  id: string
  // ... campos existentes ...
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER'  // <- NUEVO
  total: number
  items: SaleItem[]
  createdAt: Date
}
```

prisma/schema.prisma

```text
prismamodel Sale {
  id            String     @id @default(cuid())
  paymentMethod String     // "CASH" | "CARD" | "TRANSFER"
  total         Int        // en centavos
  items         SaleItem[]
  createdAt     DateTime   @default(now())
}
```

Responsable: Tú + Diego

### Tarea 2: Actualizar CheckoutModal

src/interface/components/sales/terminal/CheckoutModal.tsx

Agregar: 3 botones de método (Efectivo, Tarjeta, Transferencia), campo de monto recibido + cálculo de cambio si es Efectivo, y validación de que el monto sea mayor o igual al total.

```text
tsx<div className="flex gap-2 mt-4">
  <Button onClick={() => handlePaymentMethod('CASH')}>Efectivo</Button>
  <Button onClick={() => handlePaymentMethod('CARD')}>Tarjeta</Button>
  <Button onClick={() => handlePaymentMethod('TRANSFER')}>Transferencia</Button>
</div>

{selectedMethod === 'CASH' && (
  <div className="mt-4">
    <Input
      type="number"
      placeholder="Monto recibido"
      value={amountReceived}
      onChange={(e) => setAmountReceived(parseFloat(e.target.value))}
    />
    <p className="mt-2">Cambio: ${(amountReceived - total).toFixed(2)}</p>
  </div>
)}
```

Responsable: Tú

### Tarea 3: Actualizar SaleService

src/core/services/SaleService.ts

Modificar registerSale() para aceptar y registrar paymentMethod.
Responsable: Tú + Diego (review)

### Tarea 4: Tests unitarios

src/core/services/__tests__/saleService.test.ts

- Test de venta con método Efectivo.
- Test de cambio correcto.
- Test de rechazo si monto insuficiente.

Responsable: Tú

## 6. Convenciones del proyecto

### Nombres

- Entidades: PascalCase (Sale, Product)
- Métodos: camelCase (registerSale, calculateChange)
- Constantes: UPPER_SNAKE_CASE (PAYMENT_METHODS)
- Componentes React: PascalCase (CheckoutModal)

### Estilos

- UI con shadcn/ui + Tailwind (ya configurado).
- Sin inline styles; usar clases de Tailwind.

### Testing

- Framework: Vitest
- Ubicación: src/**/__tests__/
- Convención: describe() + it() con nombres descriptivos.

```text
typescriptdescribe('SaleService.registerSale', () => {
  it('should save sale with CASH payment method', async () => {
    // tu test aquí
  })
})
```

### Debugging

- console.log() / console.error() para debugging general.
- En componentes React: useEffect() + logger si quieres logs persistentes.
- DevTools de Electron: Ctrl+Shift+I.

## 7. A quién acudir

NecesidadResponsableCómoDecisiones de arquitecturaAlfredo (Tech Lead)Slack / DailyDudas sobre código existenteDiego (Desarrollador)Pair programmingDudas de procesoFer (Scrum Master)Standup / SlackDudas técnicas generalesEquipoStandup

## 8. Repositorio y commits

### Ramas

- main → versión estable (protegida).
- develop → rama de integración.
- feat/HU9-payment-methods → tu rama para Sprint 3.

### Flujo

```text
bash# Crear rama
git checkout -b feat/HU9-payment-methods

# Durante desarrollo
git add src/core/entities/Sale.ts
git commit -m "feat(HU9): add paymentMethod to Sale entity"

git add src/interface/components/sales/terminal/CheckoutModal.tsx
git commit -m "feat(HU9): add payment method selector to checkout modal"

# Al ir a review
git push origin feat/HU9-payment-methods
# → Crear Pull Request en GitHub

# Después de que Alfredo apruebe
git rebase develop
git push
# → Merge a develop (lo hace Alfredo)
```

## 9. Definition of Done — Sprint 3

- HU9 completa: métodos de pago funcionales.
- Unit tests pasando en SaleService.
- Code review aprobado por Alfredo.
- DEVELOPMENT.md actualizado.
- Video demo del checkout con los tres métodos.

## 10. Contacto

- Cosas urgentes: Fer en standup o Slack.
- Dudas técnicas: Alfredo o Diego.
- Dudas de proyecto: Todo el equipo en standup.

Bienvenida al equipo, Ana.