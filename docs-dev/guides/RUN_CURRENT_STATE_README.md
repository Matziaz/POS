# README de Ejecucion Actual (Estado Real Probado)

**Fecha de ejecucion:** 2026-03-05  
**Workspace:** `C:\Users\R6fle\Desktop\proyecto_scrum\POS`

Este documento resume exactamente lo que se hizo para preparar y ejecutar el proyecto en su estado actual, sin refactorizar la logica de negocio.

---

## 1. Verificaciones iniciales

Se validaron versiones y ruta actual:

```powershell
node -v
npm -v
Get-Location
```

Tambien se valido existencia de Prisma y SQLite:

```powershell
Get-ChildItem -Name prisma
Test-Path .env
Test-Path prisma/pos.db
```

Resultado esperado:

- `prisma/` existe con `schema.prisma`
- `.env` existe
- `prisma/pos.db` existe

---

## 2. Preparacion del entorno

Instalacion de dependencias:

```powershell
npm install
```

Generacion del cliente Prisma:

```powershell
npx prisma generate
```

---

## 3. Problemas detectados al intentar ejecutar

Durante la primera ejecucion se detectaron dos tipos de errores:

1. Error de modulo Electron/Node (`ERR_REQUIRE_ESM`) al cargar `dist/electron/main.js`.
2. Errores funcionales por datos inconsistentes en BD:
   - `RangeError: Invalid time value` en `product:list`
   - FK violation (`P2003`) al guardar productos (provider inexistente)

Adicionalmente, en esta maquina se observaron errores de Chromium/Electron por cache/GPU:

- `Unable to create cache`
- `GPU process exited unexpectedly`

---

## 4. Accion aplicada para estabilizar base de datos

Se reconstruyo la BD local y se cargo seed limpia:

```powershell
Remove-Item prisma/pos.db -Force
npx prisma db push
npx tsx prisma/seed.ts
```

Esto dejo datos consistentes para pruebas de inventario/ventas.

---

## 5. Arranque recomendado (tal como se probo)

Abrir 3 terminales en la raiz del proyecto.

### Terminal 1

```powershell
npm run react-dev
```

### Terminal 2

```powershell
npm run electron:dev
```

### Terminal 3

```powershell
$env:VITE_DEV_SERVER_URL='http://localhost:5173'; npm run electron
```

Si hay problema de GPU/caché en Windows:

```powershell
$env:VITE_DEV_SERVER_URL='http://localhost:5173'; npm run electron -- --disable-gpu
```

---

## 6. Nota sobre `dist/electron/package.json`

Para evitar conflictos ESM/CJS en ejecucion de Electron compilado, se utilizo:

```powershell
Set-Content -Path dist/electron/package.json -Value '{"type":"commonjs"}'
```

**Importante:** este archivo vive en `dist/` (salida de compilacion), no es parte de la logica de dominio.

---

## 7. Validacion rapida de persistencia

Con la app abierta:

1. Crear un producto en Inventario.
2. Cerrar y abrir la app.
3. Confirmar que el producto sigue existiendo.
4. Registrar una venta.
5. Confirmar en UI que aparece en historial.

Opcional: inspeccionar BD con Prisma Studio:

```powershell
npx prisma studio
```

---

## 8. Estado de arquitectura observado

Flujo actual de persistencia en runtime:

`React/Zustand -> ElectronRepository (renderer) -> preload -> ipcMain handlers -> PrismaClient -> SQLite`

Esto significa que la persistencia real actual corre por `ipcHandlers.ts` usando Prisma directo en el proceso main de Electron.

---

## 9. Cambios de archivos realizados durante esta corrida

- `prisma/pos.db` (recreada y reseedeada)
- `dist/electron/package.json` (archivo de runtime generado para CommonJS)

---

## 10. Siguiente paso sugerido

Con esta base ya estable, el siguiente paso es definir un plan de refactor por etapas para centralizar persistencia en repositorios de infraestructura (`Prisma*Repository`/`SQLite*Repository`) sin romper el flujo actual.
