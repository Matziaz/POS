export type InventoryMovementType = "IN" | "OUT";

export interface PosContext {
  /** Identificador del contexto (ej. "default", "tiendita", "farmacia") */
  readonly name: string;

  /** Defaults para primera versión */
  readonly defaultUserId: string;
  readonly defaultProviderId: string;

  /** Reglas generales */
  sku: {
    /** Normaliza el SKU antes de guardar/buscar */
    normalize(raw: string): string;
    /** Valida el SKU normalizado */
    validate(normalized: string): void; // lanza Error/ValidationError desde servicios si quieres
  };

  inventory: {
    /** Tipos de movimiento aceptados */
    readonly movementTypes: readonly InventoryMovementType[];
    /** Valida un ajuste de inventario (delta). Puede usarse en ProductService */
    validateStockDelta(delta: number): void;
  };
}