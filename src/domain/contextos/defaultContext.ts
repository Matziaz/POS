import type { PosContext } from "./PosContext";

export const defaultContext: PosContext = {
  name: "default",
  defaultUserId: "user_cashier_001",
  defaultProviderId: "provider_default",

  sku: {
    normalize(raw: string) {
      return raw.trim().toUpperCase();
    },
    validate(normalized: string) {
      if (!normalized) throw new Error("sku is required");
      // regla simple: 3..32 chars, letras/números/guiones
      if (normalized.length < 3 || normalized.length > 32) {
        throw new Error("sku length must be 3..32");
      }
      if (!/^[A-Z0-9-]+$/.test(normalized)) {
        throw new Error("sku must contain only A-Z, 0-9, and '-'");
      }
    },
  },

  inventory: {
    movementTypes: ["IN", "OUT"],
    validateStockDelta(delta: number) {
      // delta puede ser + o - pero no 0
      if (!Number.isInteger(delta) || delta === 0) {
        throw new Error("delta must be a non-zero integer");
      }
    },
  },
};