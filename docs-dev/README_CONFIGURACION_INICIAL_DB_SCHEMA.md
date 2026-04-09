# PR README - Configuracion Inicial + DB/Schema

## Resumen

Este cambio agrega el flujo de configuracion inicial en primer arranque y alinea Prisma con los cambios actuales de la base de datos SQLite.

Resultado esperado:

- La aplicacion no permite entrar al flujo principal hasta completar setup inicial.
- El contexto de negocio se selecciona y persiste desde la tabla `app_configuration`.
- El archivo `schema.prisma` refleja el estado real de la BD (introspeccion).

## Tipo de cambio

- [x] Feature
- [x] Refactor de arquitectura (dominio/repositorios/servicios)
- [x] Cambio de esquema/base de datos
- [ ] Fix

## Cambios funcionales

### 1) Setup inicial en UI

Archivos involucrados:

- `src/interface/pages/InitialSetupPage.tsx` (nuevo)
- `src/interface/components/configuration/BusinessContextSelector.tsx` (nuevo)
- `src/interface/components/configuration/index.ts` (nuevo)
- `src/App.tsx` (modificado)

Comportamiento:

- En arranque, se consulta `configurationIsSetupComplete()`.
- Si el setup no esta completo, se redirige a `/setup`.
- Se cargan contextos disponibles con `configurationListContexts()`.
- Al guardar (`configurationSaveInitial`) se activa el contexto seleccionado y se habilita el acceso.

### 2) Capa core + infraestructura para configuracion

Archivos nuevos:

- `src/core/entities/AppConfiguration.ts`
- `src/core/repositories/AppConfigurationRepository.ts`
- `src/core/services/ConfigurationService.ts`
- `src/infrastructure/persistence/PrismaAppConfigurationRepository.ts`

Archivos ajustados (barrels/exports):

- `src/core/entities/index.ts`
- `src/core/repositories/index.ts`
- `src/core/services/index.ts`
- `src/infrastructure/persistence/index.ts`
- `src/interface/pages/index.ts`

Responsabilidades principales:

- `AppConfiguration`: validacion y normalizacion de entidad.
- `ConfigurationService`: reglas de negocio del setup inicial.
- `PrismaAppConfigurationRepository`: lectura/activacion de contexto y validacion de setup completo.

### 3) Electron IPC + preload + tipado

Archivos modificados:

- `src/electron/ipcHandlers.ts`
- `src/electron/preload.ts`
- `src/electron.d.ts`

Canales agregados:

- `configuration:listContexts`
- `configuration:get`
- `configuration:isSetupComplete`
- `configuration:saveInitial`

## Cambios de base de datos y Prisma

### Base de datos

- `prisma/pos.db` actualizado (archivo binario).

### Prisma schema

- `prisma/schema.prisma` actualizado por introspeccion.

Cambios relevantes:

- `product.sku` ahora con `@unique`.
- Se removieron indices explicitos en `product` (`@@index([sku])`, `@@index([deleted_at])`) tras introspeccion.
- `sale` ahora incluye `cash_register_id` y relaciones a `cash_register` y `sale_payment`.
- `user` ahora incluye relaciones a `cash_closure` y `cash_register`.
- Nuevo modelo `app_configuration`.
- Nuevos modelos: `cash_closure`, `cash_closure_payment_breakdown`, `cash_register`, `payment_methods`, `sale_payment`.

## Riesgos e impacto

- Riesgo funcional bajo-medio: el flujo de entrada cambia por gate de setup.
- Riesgo de datos bajo: cambios en `schema.prisma` dependen del estado real de `pos.db`.
- Compatibilidad: puede afectar ambientes que no tengan datos en `app_configuration`.

## Evidencia tecnica

- Comandos ejecutados:

```bash
npx prisma db pull
npx prisma generate
```

- Estado esperado:
  - `prisma/schema.prisma` sincronizado con BD.
  - Cliente Prisma generado sin errores.

## Como probar (QA)

1. Levantar app en entorno limpio.
2. Verificar redireccion automatica a `/setup`.
3. Confirmar carga de contextos desde `app_configuration`.
4. Seleccionar contexto y guardar.
5. Validar que se activa contexto (`is_active = 1` en seleccionado).
6. Reiniciar app y confirmar acceso normal sin volver a setup.
7. Ejecutar `npx prisma generate` y verificar que no falle.

## Rollback

1. Revertir commit.
2. Restaurar `prisma/pos.db` y `prisma/schema.prisma` previos.
3. Regenerar cliente Prisma:

```bash
npx prisma generate
```

## Notas para PR

- Este documento esta pensado para adjuntarse o copiarse en la descripcion del PR.
- Si se requiere checklist organizacional (aprobaciones, issue link, evidencias UI), agregar seccion final de governance.
