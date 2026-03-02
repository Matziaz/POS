# feat/Forms — Resumen de cambios

## Qué se hizo

### 1. Formulario de registro de venta (nuevo)
- **Archivo:** `src/interface/components/sales/SaleForm.tsx`
- Buscador de productos por nombre o SKU
- Control de cantidad con botones +/- y validación de stock máximo
- Tabla de líneas de venta con subtotales
- Resumen con total de artículos y monto a cobrar
- Llama a `SaleService.registerSale()` y refresca productos (stock actualizado)

### 2. SalesPage actualizada
- **Archivo:** `src/interface/pages/SalesPage.tsx`
- Botón "Nueva Venta" en el header que abre el `SaleForm`
- Al completar una venta, refresca la lista de productos para reflejar el stock actual

### 3. productStore refactorizado
- **Archivo:** `src/interface/store/productStore.ts`
- `addProduct` ahora usa `ProductService.createProduct()` directamente (Fer ya corrigió el bug de `priceCents`)
- Se eliminaron imports innecesarios (`newId`, `DEFAULT_PROVIDER_ID`)
- Se actualizó el comentario del archivo

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/interface/components/sales/SaleForm.tsx` | **Nuevo** — formulario de nueva venta |
| `src/interface/components/sales/index.ts` | Agregado export de `SaleForm` |
| `src/interface/pages/SalesPage.tsx` | Botón + modal de nueva venta |
| `src/interface/store/productStore.ts` | Refactor `addProduct` → usa `ProductService` |

## Nota: Editar/Eliminar productos — workaround temporal

Los botones de editar y eliminar en la pantalla de inventario **sí funcionan**, pero **no pasan por `ProductService`**.

`ProductService` solo tiene estos métodos:
- `createProduct()` ✅ (ya corregido, ahora sí lo usamos)
- `listProducts()` ✅
- `getBySku()` ✅
- `setStockBySku()` ✅
- `adjustStockBySku()` ✅

**No tiene:** `updateProduct()` ni `deleteProduct()`.

### ¿Cómo funciona entonces?

En `productStore.ts`, las acciones `updateProduct` y `deleteProduct` usan el **repositorio directamente** en vez de pasar por el servicio:

```typescript
// updateProduct — workaround actual en productStore.ts
const repo = getProductRepository()
const existing = await repo.findById(id)
const updated = Product.create({ ...existing, ...input })
await repo.save(updated)   // ← directo al repo, sin servicio

// deleteProduct — workaround actual en productStore.ts
const repo = getProductRepository()
await repo.delete(id)       // ← directo al repo, sin servicio
```

Mientras que `addProduct` (ya refactorizado) sí usa el servicio:
```typescript
// addProduct — refactorizado
const service = getProductService()
await service.createProduct({ sku, name, price, stock, providerId })  // ← vía servicio
```

### ¿Es un problema?

Funciona, pero **salta la validación del servicio**. Si Fer tuviera reglas de negocio en `updateProduct()` (ej: "no permitir cambiar el SKU de un producto que ya se vendió"), el frontend las ignoraría.

### ¿Qué se necesita?

Que se agregue a `ProductService`:
```typescript
async updateProduct(id: string, input: { name?, sku?, price?, stock?, providerId? }): Promise<Product>
async deleteProduct(id: string): Promise<void>
```

Cuando existan, se cambian las 2 acciones en `productStore.ts` para usar el servicio en lugar del repo.
