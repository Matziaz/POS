# Interface Layer — Implementación Sprint 1

## Resumen

Se implementó la pantalla CRUD de Inventario dentro de `src/interface/`, consumiendo servicios y entidades definidos por Fer en `src/core/`. La persistencia real (Prisma/SQLite) aún no está conectada porque `SQLiteProductRepository` no ha sido implementado por Alfredo.

---

## Arquitectura de la solución

```
src/interface/                          ← Todo lo que implementé (mi área)
├── components/
│   ├── ui/          ← Componentes base de shadcn/ui
│   └── products/    ← Componentes específicos del CRUD
├── hooks/           ← Custom hooks de React
├── pages/           ← Pantallas completas
├── store/           ← Estado global (Zustand)
├── dev/             ← Repositorio temporal en memoria
└── lib/             ← Utilidades (cn para Tailwind)
```

### Flujo de datos

```
InventoryPage (pages/)
    ↓ usa
useProducts (hooks/)
    ↓ consume
productStore (store/ — Zustand)
    ↓ llama a
Product.create() + InMemoryProductRepository (dev/)
    ↑ importado de               ↑ sustituto temporal
    core/entities/               (debería ser SQLiteProductRepository
                                  de infrastructure/)
```

---

## Archivos que implementé (mi área: `src/interface/`)

### 1. `src/interface/pages/InventoryPage.tsx`
**Qué es:** La pantalla principal del CRUD de inventario.

**Qué hace:**
- Renderiza el título, contador de productos, y botón "Nuevo Producto"
- Orquesta la apertura/cierre de los modales (crear, editar, eliminar)
- Muestra notificaciones inline de éxito/error después de cada operación
- Consume el hook `useProducts()` para todas las operaciones

**Qué usa de otras áreas:**
- `ProductProps` (tipo) de `@core/entities` — para tipar los datos del producto

---

### 2. `src/interface/store/productStore.ts`
**Qué es:** Store global con Zustand que maneja el estado de productos.

**Qué hace:**
- Mantiene la lista de productos, estado de carga, errores, y producto seleccionado
- Expone acciones: `fetchProducts`, `addProduct`, `updateProduct`, `deleteProduct`
- Valida SKU duplicado antes de crear/actualizar
- Maneja errores y los expone al UI

**Qué usa de otras áreas:**
- `Product` (clase) y `ProductProps` (tipo) de `@core/entities` — para crear instancias de producto con validación
- `newId()` de `@core/services/id` — para generar UUIDs al crear productos
- `DEFAULT_PROVIDER_ID` de `@core/constants` — como proveedor por defecto
- `ProductService` de `@core/services` — para `listProducts()` (el único método funcional del servicio)

**Nota:** Para `addProduct`, `updateProduct` y `deleteProduct` se usa el repositorio directamente porque `ProductService` de Fer aún no tiene esos métodos (solo tiene `createProduct`, `getBySku`, `listProducts`), y `createProduct` tiene un bug (`priceCents` en vez de `price`, falta `providerId`).

---

### 3. `src/interface/hooks/useProducts.ts`
**Qué es:** Custom hook que envuelve el store para los componentes.

**Qué hace:**
- Ejecuta `fetchProducts()` automáticamente al montar el componente
- Expone una API limpia: `products`, `isLoading`, `error`, `addProduct`, `updateProduct`, `deleteProduct`, etc.
- Desacopla los componentes del store (si cambia la implementación del store, los componentes no se tocan)

**Qué usa de otras áreas:**
- `ProductProps` de `@core/entities` — para el tipado del retorno

---

### 4. `src/interface/components/products/ProductTable.tsx`
**Qué es:** Tabla que muestra todos los productos con sus propiedades.

**Qué hace:**
- Muestra columnas: SKU, Nombre, Precio, Stock, Proveedor, Fecha de creación, Acciones
- Formatea precio con `$` y 2 decimales usando constantes de `@shared/constants`
- Muestra badges de stock (rojo si 0, amarillo si ≤5, gris si normal)
- Botones de editar (lápiz) y eliminar (basura) por fila
- Estado vacío cuando no hay productos (ícono + mensaje)
- Skeleton de carga mientras se obtienen los datos

**Qué usa de otras áreas:**
- `ProductProps` de `@core/entities`
- `CURRENCY_SYMBOL` y `DECIMAL_PLACES` de `@shared/constants`

---

### 5. `src/interface/components/products/ProductForm.tsx`
**Qué es:** Modal con formulario para crear o editar un producto.

**Qué hace:**
- Modo **crear**: campos vacíos, título "Nuevo Producto"
- Modo **editar**: campos pre-llenados con datos existentes, título "Editar Producto"
- Campos: SKU, Nombre, Precio (number), Stock (number), Proveedor
- Validación inline: campos requeridos, precio > 0, stock ≥ 0 entero
- Muestra errores del servidor (ej: SKU duplicado)
- Estado de "Guardando..." mientras procesa

**Qué usa de otras áreas:**
- `ProductProps` de `@core/entities`
- `DEFAULT_PROVIDER_ID` de `@core/constants` — valor por defecto del campo proveedor

---

### 6. `src/interface/components/products/ProductDeleteDialog.tsx`
**Qué es:** Diálogo de confirmación para eliminar un producto.

**Qué hace:**
- Muestra nombre y SKU del producto a eliminar
- Botones "Cancelar" y "Eliminar" (rojo)
- Estado de "Eliminando..." mientras procesa

**Qué usa de otras áreas:**
- `ProductProps` de `@core/entities`

---

### 7. `src/interface/dev/InMemoryProductRepository.ts`
**Qué es:** Implementación temporal del `ProductRepository` que guarda datos en memoria.

**Por qué existe:** `SQLiteProductRepository` está vacío. Sin él, la UI no puede leer/escribir a la base de datos. Este archivo es un sustituto para poder desarrollar la UI de forma independiente.

**Qué hace:**
- Implementa la interfaz `ProductRepository` de core usando un `Map<string, Product>`
- Pre-carga 5 productos de ejemplo al inicializar
- Incluye método `delete()` (que aún no existe en la interfaz oficial de `ProductRepository`)

**Qué usa de otras áreas:**
- `Product` de `@core/entities` — para crear instancias
- `ProductRepository` (interfaz) de `@core/repositories` — el contrato que implementa
- `DEFAULT_PROVIDER_ID` de `@core/constants`
- `newId()` de `@core/services/id`

---

### 8. `src/interface/dev/serviceFactory.ts`
**Qué es:** Factory que instancia los servicios con el repositorio en memoria.

**Qué hace:**
- Crea un singleton de `InMemoryProductRepository` y `ProductService`
- Expone `getProductService()` y `getProductRepository()`
- El repositorio se expone directamente porque `ProductService` no tiene todos los métodos CRUD

**Cuándo se reemplaza:** Cuando se implemente `SQLiteProductRepository`, se cambia la línea del `new InMemoryProductRepository()` por `new SQLiteProductRepository()` y todo queda conectado a la DB real.

**Qué usa de otras áreas:**
- `ProductService` de `@core/services`

---

### 9. Componentes UI base (`src/interface/components/ui/`)
**Qué son:** Componentes de shadcn/ui (Button, Input, Label, Table, Dialog, AlertDialog, Badge).

**Por qué están aquí:** shadcn/ui no es una librería que se instala — son archivos de componentes que se copian al proyecto. Viven en `interface/components/ui/` porque son parte de la capa de presentación.

---

### 10. `src/interface/lib/utils.ts`
**Qué es:** Utilidad `cn()` que combina clases de Tailwind CSS de forma inteligente (merge de clases conflictivas).

---

## Qué usé de otras áreas (sin modificar)

| Archivo | Área | Autor | Qué usé |
|---------|------|-------|---------|
| `src/core/entities/Product.ts` | core | Fer | Clase `Product`, tipo `ProductProps`, método `create()`, `toJSON()` |
| `src/core/repositories/ProductRepository.ts` | core | Fer | Interfaz `ProductRepository` (contrato) |
| `src/core/services/ProductService.ts` | core | Fer | Clase `ProductService` — solo `listProducts()` funciona bien |
| `src/core/services/id.ts` | core | Fer | Función `newId()` para generar UUIDs |
| `src/core/constants.ts` | core | Fer | `DEFAULT_PROVIDER_ID` |
| `src/shared/constants/index.ts` | shared | Fer | `CURRENCY_SYMBOL`, `DECIMAL_PLACES` |

---

## Archivos raíz modificados/creados

| Archivo | Qué hice |
|---------|----------|
| `tailwind.config.js` | **Creado** — config de Tailwind con theme de shadcn/ui |
| `postcss.config.js` | **Creado** — config de PostCSS para Tailwind |
| `src/index.css` | **Modificado** — agregué CSS variables de shadcn/ui |
| `src/App.tsx` | **Modificado** — reemplacé landing estática por HashRouter con ruta `/inventario` |

---

## Dependencias instaladas

```
react-router-dom          — navegación entre páginas
class-variance-authority  — variantes de estilo para componentes
clsx                      — utilidad para clases condicionales
tailwind-merge            — merge inteligente de clases Tailwind
lucide-react              — íconos (lápiz, basura, paquete, plus)
sonner                    — toasts (instalado, no usado aún)
@radix-ui/react-dialog    — primitiva accesible para modales
@radix-ui/react-alert-dialog — primitiva para diálogos de confirmación
@radix-ui/react-label     — primitiva para labels de formulario
@radix-ui/react-slot      — composición de componentes (Button asChild)
tailwindcss-animate       — animaciones para shadcn/ui (dev dep)
autoprefixer              — prefijos CSS automáticos (dev dep)
```

---

## Bloqueantes para integración real

### (core/)
1. **Bug:** `ProductService.createProduct()` pasa `priceCents` a `Product.create()`, pero la entidad espera `price`
2. **Faltante:** `createProduct()` no acepta `providerId` en su input (la entidad lo requiere)
3. **Faltantes:** Métodos `updateProduct()`, `deleteProduct()`, `getById()` en `ProductService`
4. **Faltante:** Método `delete(id)` en la interfaz `ProductRepository`

### (infrastructure/)
1. **Implementar** `SQLiteProductRepository` en `src/infrastructure/persistence/` usando `prismaClient`
2. Cuando esté listo, cambiar una línea en `serviceFactory.ts` para conectar a la DB real
