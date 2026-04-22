# README - Apertura de caja para terminal de ventas

## Resumen

En esta entrega se agrego el flujo de apertura de caja para habilitar el registro de ventas desde la terminal.

Objetivo principal:

- Evitar registrar ventas si no existe una caja abierta.
- Permitir abrir una caja desde la interfaz de `Terminal de venta`.
- Conectar ese flujo con IPC y repositorio de persistencia.
- Crear las entidades, contratos y repositorios necesarios para los nuevos modelos del schema.

## Alcance funcional

### 1) Bloqueo por caja no abierta en terminal

Archivo:

- `src/interface/pages/SalesTerminalPage.tsx`

Comportamiento nuevo:

- Al entrar a la terminal se consulta si hay caja abierta (`cashRegisterGetOpen`).
- Si no hay caja abierta, se muestra formulario de apertura (monto inicial).
- Al abrir la caja (`cashRegisterOpen`), se habilita la UI de venta.
- Si ya existe caja abierta, se muestra su identificador y se permite vender.

### 2) Creacion de entidades, contratos y repositorios

Para soportar el nuevo schema y dejar preparada la capa de dominio/persistencia, se agregaron piezas nuevas en core e infrastructure.

Entidades nuevas:

- `src/core/entities/CashRegister.ts`
- `src/core/entities/PaymentMethod.ts`
- `src/core/entities/SalePayment.ts`
- `src/core/entities/CashClosure.ts`
- `src/core/entities/CashClosurePaymentBreakdown.ts`

Contratos de repositorio nuevos:

- `src/core/repositories/CashRegisterRepository.ts`
- `src/core/repositories/PaymentMethodRepository.ts`
- `src/core/repositories/SalePaymentRepository.ts`
- `src/core/repositories/CashClosureRepository.ts`
- `src/core/repositories/CashClosurePaymentBreakdownRepository.ts`

Repositorios Prisma nuevos:

- `src/infrastructure/persistence/PrismaCashRegisterRepository.ts`
- `src/infrastructure/persistence/PrismaPaymentMethodRepository.ts`
- `src/infrastructure/persistence/PrismaSalePaymentRepository.ts`
- `src/infrastructure/persistence/PrismaCashClosureRepository.ts`
- `src/infrastructure/persistence/PrismaCashClosurePaymentBreakdownRepository.ts`

### 3) Nuevos canales IPC para caja

Archivo:

- `src/electron/ipcHandlers.ts`

Canales agregados:

- `cashRegister:getOpen`
- `cashRegister:open`

Reglas implementadas:

- No permite abrir una nueva caja si ya hay una en estado `open`.
- Valida que el monto de apertura sea un numero >= 0.
- Crea caja con `id` nuevo y `status = "open"`.

### 4) API expuesta al renderer

Archivos:

- `src/electron/preload.ts`
- `src/electron.d.ts`

Metodos agregados en `window.electronAPI`:

- `cashRegisterGetOpen(): Promise<CashRegisterJSON | null>`
- `cashRegisterOpen(data: CashRegisterCreateJSON): Promise<CashRegisterJSON>`

## Alineacion de arquitectura con schema nuevo

Ademas del flujo de UI de caja, se agrego la base de dominio, contratos y persistencia para los nuevos modelos del schema.

### Ajustes adicionales relacionados

- `src/core/entities/Sale.ts` (soporte `cashRegisterId`)
- `src/core/services/SaleService.ts` (propagacion opcional de `cashRegisterId`)
- `src/infrastructure/persistence/PrismaSaleRepository.ts` (resolucion de caja para guardar venta)
- `src/core/entities/index.ts`
- `src/core/repositories/index.ts`
- `src/infrastructure/persistence/index.ts`

## Impacto esperado

- Mejora de control operativo: no hay ventas sin contexto de caja abierta.
- Preparacion de base para siguientes features:
  - cierre de caja
  - desglose por metodos de pago
  - conciliacion de ventas por caja

## Como probar

1. Levantar app en Electron.
2. Ir a `Terminal de venta`.
3. Si no hay caja abierta:
   - Verificar vista de apertura de caja.
   - Ingresar monto inicial y abrir caja.
4. Confirmar que la terminal se habilita despues de abrir caja.
5. Registrar una venta y validar que persiste correctamente.
6. Reabrir terminal y confirmar que detecta caja abierta.

## Notas tecnicas

- Si aparecen errores de tipos de Prisma tras cambios de schema, regenerar cliente:

```bash
npx prisma generate
```

- Este cambio no implementa aun el cierre de caja (solo apertura y validacion de caja abierta para ventas).
