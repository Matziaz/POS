import React from "react";
import type { RetailContext } from "@core/entities";

interface BusinessContextSelectorProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function toDescription(context: string): string {
  switch (context) {
    case "retail":
      return "Tienda general y ventas de mostrador";
    case "abarrotes":
      return "Venta rapida de productos de consumo diario";
    case "farmacia":
      return "Operacion orientada a medicamentos y control basico";
    default:
      return "Contexto de negocio configurable";
  }
}

export const BusinessContextSelector: React.FC<BusinessContextSelectorProps> = ({ value, options, onChange }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const contextValue = option.toLowerCase() as RetailContext;
        const selected = contextValue === value;
        return (
          <button
            key={contextValue}
            type="button"
            className={`rounded-lg border p-4 text-left transition-colors ${
              selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
            onClick={() => onChange(contextValue)}
          >
            <div className="text-sm font-semibold">{contextValue.charAt(0).toUpperCase() + contextValue.slice(1)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{toDescription(contextValue)}</p>
          </button>
        );
      })}
    </div>
  );
};
