# Sprint 1.5 — Integración E2E (feat/IntegrationE2E)

**Fecha:** 2 de marzo de 2026  
**Autor:** Diego Rodríguez (Scrum Master / Interface)  
**Herramienta:** Implementado con asistencia de IA (GitHub Copilot — Claude)  
**Branch:** `feat/IntegrationE2E`  
**Objetivo:** Conectar el frontend React al SQLite real vía Electron IPC, cerrando Sprint 1.5.

> **Nota:** Esta tarea originalmente estaba asignada a Alfredo (Infraestructura), pero como era bloqueante para todo el equipo, Diego la tomó directamente con apoyo de IA para desbloquear el Sprint 1.5.

---

## Problema

PrismaClient **no puede correr en el renderer** de Electron (entorno browser). Intentar instanciar `PrismaProductRepository` directamente en el frontend lanzaba:

> *PrismaClient is unable to run in this browser environment*

## Solución: IPC Bridge

```
React (renderer) → window.electronAPI (preload) → ipcMain handlers → Prisma → SQLite
```

Toda operación de base de datos viaja como JSON plano por IPC. Las entidades se reconstruyen en el renderer con `Entity.create()`.

---

## Archivos creados

### Prisma Repositories (main process)

| Archivo | Descripción |
|---------|-------------|
| `src/infrastructure/persistence/PrismaSaleRepository.ts` | Implementa `SaleRepository` con Prisma. Guarda ventas con sus items. |
| `src/infrastructure/persistence/PrismaInventoryMovementRepository.ts` | Implementa `InventoryMovementRepository` con Prisma. |

### Electron IPC

| Archivo | Descripción |
|---------|-------------|
| `src/electron/ipcHandlers.ts` | Registra todos los handlers IPC (`product:*`, `sale:*`, `inventoryMovement:*`). PrismaClient propio, aislado del renderer. Exporta `registerAllIpcHandlers()` y `disconnectPrisma()`. |
| `src/electron/preload.ts` | `contextBridge.exposeInMainWorld("electronAPI", {...})` — expone los canales IPC al renderer de forma segura. |

### Electron Repo Adapters (renderer)

| Archivo | Descripción |
|---------|-------------|
| `src/interface/dev/ElectronProductRepository.ts` | Implementa `ProductRepository` llamando a `window.electronAPI`. |
| `src/interface/dev/ElectronSaleRepository.ts` | Implementa `SaleRepository` llamando a `window.electronAPI`. |
| `src/interface/dev/ElectronInventoryMovementRepository.ts` | Implementa `InventoryMovementRepository` llamando a `window.electronAPI`. |

### Type Declaration

| Archivo | Descripción |
|---------|-------------|
| `src/electron.d.ts` | Declara `window.electronAPI` globalmente en TypeScript (interfaces `ElectronAPI`, `ProductJSON`, `SaleJSON`, etc.). |

---

## Archivos modificados

### `src/electron/main.ts`
- **Preload**: agregado `preload: path.join(__dirname, "preload.js")` a `webPreferences`.
- **IPC**: se llama `registerAllIpcHandlers()` antes de crear la ventana.
- **Cleanup**: se llama `disconnectPrisma()` en `window-all-closed`.

### `src/interface/dev/serviceFactory.ts`
- **Eliminado** import de `PrismaProductRepository` (no puede correr en renderer).
- **Detección automática**: si `window.electronAPI` existe → usa `Electron*Repository`. Si no → usa `InMemory*Repository`.
- Logs de diagnóstico actualizados para mostrar si Electron fue detectado.

### Electron Repos (3 archivos)
- Reemplazado `(window as any).electronAPI` por `window.electronAPI` tipado gracias a `electron.d.ts`.

---

## Problemas encontrados y resueltos durante la integración

### 1. Electron no generaba archivos JS (`noEmit` heredado)
- **Problema:** `tsconfig.electron.json` extendía `tsconfig.json` que tiene `"noEmit": true`. La compilación pasaba sin errores pero no generaba archivos en `dist/`.
- **Solución:** Agregar `"noEmit": false` y `"allowImportingTsExtensions": false` explícitamente en `tsconfig.electron.json`.

### 2. `ERR_REQUIRE_ESM` al iniciar Electron
- **Problema:** `package.json` tiene `"type": "module"`, pero Electron 27 carga el entry point con `require()` (CommonJS). Los archivos compilados como ESM (`import`/`export`) no se podían cargar.
- **Solución:**
  - Cambiar `tsconfig.electron.json` a `"module": "CommonJS"`, `"moduleResolution": "node"`.
  - Quitar `import.meta.url` / `fileURLToPath` de `main.ts` (solo existen en ESM; en CJS `__dirname` es global).
  - Crear `dist/electron/package.json` con `{"type": "commonjs"}` para override del `"type": "module"` del root.

### 3. `ERR_FILE_NOT_FOUND` — pantalla en blanco
- **Problema:** Al correr `npm run electron` solo, la variable `VITE_DEV_SERVER_URL` no estaba definida, así que Electron intentaba cargar `dist/renderer/index.html` (build de producción que no existe en dev).
- **Solución:** Actualizar scripts en `package.json` con `concurrently`, `wait-on` y `cross-env` para que `npm run dev` levante Vite, compile Electron en watch mode, y luego lance Electron con `VITE_DEV_SERVER_URL=http://localhost:3000`.

### 4. `DATABASE_URL` no encontrada por Prisma
- **Problema:** El proceso Electron no carga automáticamente el archivo `.env`. PrismaClient necesita `DATABASE_URL` en `process.env` pero no la encuentra.
- **Solución:** Configurar PrismaClient con la URL directa en `ipcHandlers.ts` usando `app.getAppPath()` para construir la ruta absoluta a `prisma/pos.db`, sin depender de variables de entorno.

### 5. `package.json` "main" apuntaba a ruta incorrecta
- **Problema:** `"main": "dist/main.js"` pero los archivos se compilan a `dist/electron/main.js` (porque `rootDir: src` y los archivos están en `src/electron/`).
- **Solución:** Cambiar a `"main": "dist/electron/main.js"`.

---

## Archivos de configuración modificados

### `tsconfig.electron.json`
- `module`: `NodeNext` → `CommonJS`
- `moduleResolution`: `NodeNext` → `node`
- Agregado `"noEmit": false`, `"allowImportingTsExtensions": false`, `"esModuleInterop": true`

### `package.json`
- `main`: `dist/main.js` → `dist/electron/main.js`
- Scripts actualizados: `dev` ahora usa `concurrently` con `wait-on` + `cross-env`
- Dependencias dev nuevas: `wait-on`, `cross-env`

### `dist/electron/package.json` (nuevo)
- Override `{"type": "commonjs"}` para que Node trate los `.js` compilados como CJS

---

## Canales IPC registrados

| Canal | Operación |
|-------|-----------|
| `product:list` | Listar todos los productos |
| `product:findById` | Buscar producto por ID |
| `product:findBySku` | Buscar producto por SKU |
| `product:save` | Guardar/crear producto (upsert) |
| `product:delete` | Eliminar producto |
| `product:forceDelete` | Forzar borrado: elimina en transacción las dependencias (`sale_item`, `inventory_movement`) y luego el `product` (solo en desarrollo) |
| `sale:list` | Listar todas las ventas (con items) |
| `sale:findById` | Buscar venta por ID (con items) |
| `sale:save` | Guardar venta con items |
| `inventoryMovement:save` | Guardar movimiento de inventario |
| `inventoryMovement:listByProduct` | Listar movimientos por producto |

---

## Nota sobre eliminación de productos

- `product:delete` ahora valida que no existan dependencias en `sale_item` ni `inventory_movement` antes de borrar; si existen, lanza un error descriptivo para evitar violaciones de FK.
- Se añadió `product:forceDelete` (handler de desarrollo) que, en una transacción, elimina primero las filas en `sale_item` y `inventory_movement` relacionadas y luego elimina el `product`. Esto facilita limpiar registros creados por el `seed.ts` sin cambiar la política de FK en producción.
- Importante: `product:forceDelete` NO elimina automáticamente la fila `sale` aunque quede sin `sale_item` (la venta queda como registro huérfano). Si deseas que las ventas sin items se borren automáticamente, se puede:
  - incluir la eliminación de ventas vacías dentro de la misma transacción (menos seguro), o
  - ejecutar un handler separado `sale:cleanupEmpty` después de la operación.

Ejemplo (DevTools Console) para forzar el borrado de `p1`:

```js
window.electronAPI.invoke('product:forceDelete', 'p1')
  .then(() => console.log('producto eliminado con dependencias'))
  .catch(console.error)
```

Usa esto solo en entornos de desarrollo o cuando estés seguro de las consecuencias sobre la integridad de datos.


## Cómo verificar

1. Compilar Electron TS: `npx tsc -p tsconfig.electron.json`
2. Ejecutar: `npm run dev` (Vite + Electron)
3. Abrir DevTools (`Ctrl+Shift+I`) y verificar logs:
   - `[serviceFactory] Electron detected: true`
   - `[serviceFactory] Product repo = ElectronProductRepository`
4. Crear un producto, cerrar la app, volver a abrir → el producto debe persistir.

---

## Siguiente paso

Compilar, probar la integración de extremo a extremo, y cerrar las HU de Sprint 1.5:
- **HU1**: Productos se persisten en SQLite ✅
- **HU2**: Ventas se persisten en SQLite ✅
- **HU3**: Datos sobreviven al reinicio de la app ✅

---

## Metodología

Todo el código de esta rama fue generado con asistencia de **GitHub Copilot (Claude)** bajo la dirección y supervisión de Diego. La IA propuso la arquitectura IPC bridge, generó los archivos, y diagnosticó los errores de integración (ESM/CJS, env vars, rutas). Diego validó cada paso, probó la app, y reportó los errores que la IA resolvió iterativamente.
