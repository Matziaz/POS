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
import type { RegisterSalePaymentInput } from "@interface/store/salesStore"
interface CheckoutModalProps {
  isOpen: boolean
  total: number
  isSubmitting?: boolean
  onClose: () => void
  onConfirmPayment: (payments: RegisterSalePaymentInput[]) => void
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  total,
  isSubmitting = false,
  onClose,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [selectedMethodIsCash, setSelectedMethodIsCash] = useState<boolean>(false)
  
  const handleSelectMethod = async (method: PaymentMethod) => {
      setSelectedMethod(method)
      const methods = await window.electronAPI?.paymentMethodListActive?.()
      const found = methods?.find((m: any) => m.id === method)
      setSelectedMethodIsCash(found?.isCash === 1)
  }

  const handleConfirmPayment = (amountReceived: number) => {
    if (!selectedMethod) return

    const payment: RegisterSalePaymentInput = {
      paymentMethodId: selectedMethod,
      amount: total,
      tendered: selectedMethodIsCash ? amountReceived : undefined,
      changeDue: selectedMethodIsCash ? Math.max(0, amountReceived - total) : undefined,
    }
      onConfirmPayment([payment])
      setSelectedMethod(null)
      setSelectedMethodIsCash(false)
    }
  

  const handleBackClick = () => {
    setSelectedMethod(null)
  }

  const handleClose = () => {
    setSelectedMethod(null)
    setSelectedMethodIsCash(false)
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

        <DialogHeader className="text-center">
          <DialogTitle className="text-center">
            {selectedMethod ? "Confirmar Pago" : "Seleccionar Método de Pago"}
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
              <PaymentMethodSelector selected={selectedMethod} onSelect={handleSelectMethod} />

              <Button variant="outline" className="w-full" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
            </>
          ) : selectedMethodIsCash ? (
            <CashPayment
              total={total}
              onConfirm={handleConfirmPayment}
              isSubmitting={isSubmitting}
            />
          ) : (
            <Button
              className="w-full"
              onClick={() => handleConfirmPayment(total)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Confirmar Pago"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
