import type { PosContext } from "./PosContext";

export const retailContext: PosContext = {
  name: "retail",
  defaultUserId: "user_cashier_001",
  defaultProviderId: "provider_default",

  sku: {
    normalize(raw: string) {
      return raw.trim().toUpperCase();
    },
    validate(normalized: string) {
      if (!normalized) throw new Error("sku is required");
    },
  },

  inventory: {
    movementTypes: ["IN", "OUT"],
    validateStockDelta(delta: number) {
      if (!Number.isInteger(delta) || delta === 0) {
        throw new Error("delta must be a non-zero integer");
      }
    },
  },
};
