import React from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@interface/components/ui/button"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import type { SaleSessionLine } from "@interface/store/saleSessionStore"

interface TicketSummaryProps {
  lines: SaleSessionLine[]
  isSubmitting: boolean
  onIncrement: (sku: string) => void
  onDecrement: (sku: string) => void
  onRemove: (sku: string) => void
  onCheckout: () => void
}

export const TicketSummary: React.FC<TicketSummaryProps> = ({
  lines,
  isSubmitting,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}) => {
  const totalItems = lines.reduce((acc, line) => acc + line.qty, 0)
  const total = lines.reduce((acc, line) => acc + line.qty * line.price, 0)

  return (
    <aside className="flex h-full flex-col rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-base font-semibold">Ticket actual</h2>
        <p className="text-sm text-muted-foreground">
          {totalItems} articulo{totalItems === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {lines.length === 0 && (
          <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">
            Agrega productos para iniciar la venta.
          </div>
        )}

        {lines.map((line) => (
          <div key={line.productSku} className="rounded-md border p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-sm font-medium">{line.productName}</p>
              <button
                type="button"
                className="text-muted-foreground transition-colors hover:text-destructive"
                onClick={() => onRemove(line.productSku)}
                aria-label={`Quitar ${line.productName}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2 text-xs text-muted-foreground">
              {CURRENCY_SYMBOL}{line.price.toFixed(DECIMAL_PLACES)} c/u
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDecrement(line.productSku)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-6 text-center text-sm font-semibold">{line.qty}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onIncrement(line.productSku)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <p className="text-sm font-semibold">
                {CURRENCY_SYMBOL}{(line.qty * line.price).toFixed(DECIMAL_PLACES)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-2xl font-bold">
            {CURRENCY_SYMBOL}{total.toFixed(DECIMAL_PLACES)}
          </span>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={lines.length === 0 || isSubmitting}
          onClick={onCheckout}
        >
          {isSubmitting ? "Procesando..." : "Proceder al pago"}
        </Button>
      </div>
    </aside>
  )
}
