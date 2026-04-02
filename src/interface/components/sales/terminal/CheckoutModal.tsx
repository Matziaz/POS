import React, { useState } from "react"
import { ArrowLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@interface/components/ui/dialog"
import { Button } from "@interface/components/ui/button"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import { PaymentMethodSelector, type PaymentMethod } from "./PaymentMethodSelector"
import { CashPayment } from "./CashPayment"

interface CheckoutModalProps {
  isOpen: boolean
  total: number
  isSubmitting?: boolean
  onClose: () => void
  onConfirmPayment: (method: PaymentMethod, amountReceived?: number) => void
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  total,
  isSubmitting = false,
  onClose,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)

  const handleConfirmPayment = (amountReceived: number) => {
    if (selectedMethod) {
      onConfirmPayment(selectedMethod, amountReceived)
    }
  }

  const handleBackClick = () => {
    setSelectedMethod(null)
  }

  const handleClose = () => {
    setSelectedMethod(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-sm">
        {selectedMethod && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4 h-9 w-9 p-0"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <DialogHeader>
          <DialogTitle>
            {selectedMethod ? "Pago en Efectivo" : "Seleccionar Método de Pago"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total */}
          <div className="rounded-lg bg-primary/10 p-4 text-center">
            <p className="text-xs text-muted-foreground">Total a pagar</p>
            <p className="text-3xl font-bold text-primary">
              {CURRENCY_SYMBOL}{total.toFixed(DECIMAL_PLACES)}
            </p>
          </div>

          {/* Selector de método o formulario de efectivo */}
          {!selectedMethod ? (
            <>
              <PaymentMethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />

              <Button variant="outline" className="w-full" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
            </>
          ) : (
            <CashPayment
              total={total}
              onConfirm={handleConfirmPayment}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
