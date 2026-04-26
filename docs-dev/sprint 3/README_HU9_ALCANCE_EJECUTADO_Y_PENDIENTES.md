# HU9 — Métodos de Pago
> Sprint 3 · Anairam San Nicolás · 22 abril 2026 · `feat/payment-methods`

---

## Resumen

Los métodos de pago del checkout estaban hardcodeados. Ahora se cargan desde la base de datos. El administrador puede activar o desactivar métodos desde el panel de Admin sin tocar código.

---

## ¿Por qué existía este problema?

La tabla `payment_methods` existía en la BD desde el seed inicial, pero `PaymentMethodSelector.tsx` la ignoraba completamente y definía sus propios métodos en un arreglo estático. Esto creaba una fuente de verdad falsa en el frontend desincronizada de la BD.

---

## Qué se implementó

### Métodos de pago dinámicos

`PaymentMethodSelector.tsx` ahora consulta `paymentMethod:listActive` al montarse y renderiza únicamente los métodos con `is_active = 1` en la BD. Los íconos se resuelven en frontend con un mapa estático por nombre de método (`cash`, `card`, `transfer`). Si llega un nombre no contemplado en el mapa, se muestra un ícono genérico de fallback.

El flujo de pago no cambió — `CashPayment.tsx` ya calculaba el cambio correctamente. Solo se reconectó al nuevo origen dinámico de métodos.

---

## Flujo técnico

```
[Usuario abre checkout]
  PaymentMethodSelector
    → electronAPI.paymentMethodListActive()
    → IPC: paymentMethod:listActive
    → PrismaPaymentMethodRepository.listActive()
    → BD: SELECT * FROM payment_methods WHERE is_active = 1

[Usuario confirma pago]
  CheckoutModal → onConfirmPayment(payments[])
    → SalesTerminalPage → salesStore.registerSale(lines, payments)
    → SaleService.registerSale()
        → Sale.create() + SalePayment.create() × pago
        → saleRepository.save() + salePaymentRepository.save()
        → BD: INSERT INTO sale + sale_payment
```

---

## Archivos modificados

### Modificados

```
src/core/services/
  SaleService.ts                              — recibe y persiste pagos por venta

src/interface/
  components/sales/terminal/
    PaymentMethodSelector.tsx                 — carga dinámica + mapa de íconos
    CheckoutModal.tsx                         — reconectado al flujo dinámico
  pages/
    SalesTerminalPage.tsx                     — fix cashRegister null reference
  hooks/
    useSales.ts                               — firma actualizada con RegisterSaleOptions
  store/
    salesStore.ts                             — RegisterSalePaymentInput y RegisterSaleOptions
  dev/
    serviceFactory.ts                         — inyección de salePaymentRepository

src/electron/
  ipcHandlers.ts                              — handlers salePayment y paymentMethod
  preload.ts                                  — métodos IPC expuestos al renderer
  electron.d.ts                               — tipos de salePayment y paymentMethod

src/domain/contextos/
  defaultContext.ts                           — defaultUserId actualizado

prisma/
  seed.ts                                     — métodos de pago iniciales (cash, card, transfer)
```

### Creados

```
src/interface/dev/
  ElectronSalePaymentRepository.ts            — repositorio IPC para sale_payment
  InMemorySalePaymentRepository.ts            — repositorio en memoria para desarrollo
```

---

## Pendientes

- **Desglose por método en Reportes** — los datos ya existen en `sale_payment`. Falta canal IPC y componente visual. Extensión natural de esta HU.

