import React, { useState } from "react"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import { cn } from "@interface/lib/utils"

interface CashPaymentProps {
  total: number
  onConfirm: (amountReceived: number) => void
  isSubmitting?: boolean
}

export const CashPayment: React.FC<CashPaymentProps> = ({ total, onConfirm, isSubmitting = false }) => {
  const [amountReceived, setAmountReceived] = useState("")

  const parsedAmount = parseFloat(amountReceived) || 0
  const change = Math.max(0, parsedAmount - total)
  const isValidAmount = parsedAmount >= total

  const handleNumpad = (digit: string) => {
    if (digit === "." && amountReceived.includes(".")) return

    setAmountReceived((prev) => {
      const updated = prev + digit
      // Limitar a 2 decimales
      if (updated.includes(".")) {
        const [_integer, decimal] = updated.split(".")
        if (decimal.length > DECIMAL_PLACES) return prev
      }
      return updated
    })
  }

  const handleBackspace = () => {
    setAmountReceived((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    setAmountReceived("")
  }

  const handleConfirm = () => {
    if (isValidAmount) {
      onConfirm(parsedAmount)
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="space-y-3 rounded-lg bg-muted p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total a pagar</span>
          <span className="text-2xl font-bold">
            {CURRENCY_SYMBOL}{total.toFixed(DECIMAL_PLACES)}
          </span>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cambio</span>
            <span
              className={cn(
                "text-xl font-bold",
                change > 0 ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {CURRENCY_SYMBOL}{change.toFixed(DECIMAL_PLACES)}
            </span>
          </div>
        </div>
      </div>

      {/* Input de monto recibido */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Monto recibido</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
            {CURRENCY_SYMBOL}
          </span>
          <Input
            type="text"
            inputMode="decimal"
            value={amountReceived}
            onChange={(e) => setAmountReceived(e.target.value)}
            placeholder="0.00"
            className="border-2 border-green-600 pl-8 text-lg font-semibold"
            disabled={isSubmitting}
          />
          {amountReceived && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground hover:text-foreground"
              disabled={isSubmitting}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Teclado numérico */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <Button
              key={digit}
              type="button"
              variant="outline"
              className="h-12 text-lg font-semibold"
              onClick={() => handleNumpad(digit.toString())}
              disabled={isSubmitting}
            >
              {digit}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 text-lg font-semibold"
            onClick={() => handleNumpad(".")}
            disabled={isSubmitting}
          >
            .
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 text-lg font-semibold"
            onClick={() => handleNumpad("0")}
            disabled={isSubmitting}
          >
            0
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 text-lg font-semibold"
            onClick={handleBackspace}
            disabled={isSubmitting}
          >
            ⌫
          </Button>
        </div>
      </div>

      {/* Botón confirmar */}
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!isValidAmount || isSubmitting}
        onClick={handleConfirm}
      >
        {isSubmitting ? "Procesando..." : "Confirmar Pago"}
      </Button>

      {!isValidAmount && amountReceived && (
        <p className="text-xs text-destructive">
          El monto debe ser igual o mayor a {CURRENCY_SYMBOL}
          {total.toFixed(DECIMAL_PLACES)}
        </p>
      )}
    </div>
  )
}
