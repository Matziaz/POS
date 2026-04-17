import React from "react"
import { CreditCard, Banknote, DollarSign, Tag } from "lucide-react"
import { cn } from "@interface/lib/utils"

export type PaymentMethod = "cash" | "card" | "transfer" | "voucher"

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
  disabled?: boolean
}

const methods: Array<{ id: PaymentMethod; label: string; icon: React.ReactNode }> = [
  { id: "cash", label: "Efectivo", icon: <Banknote className="h-6 w-6" /> },
  { id: "card", label: "Tarjeta", icon: <CreditCard className="h-6 w-6" /> },
  { id: "transfer", label: "Transferencia", icon: <DollarSign className="h-6 w-6" /> },
  { id: "voucher", label: "Vales", icon: <Tag className="h-6 w-6" /> },
]


export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          disabled={disabled || method.id === "voucher"}
          onClick={() => onSelect(method.id)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
            selected === method.id
              ? "border-primary bg-primary/10"
              : "border-border bg-background hover:border-primary/50",
            method.id === "voucher" && "cursor-not-allowed opacity-50",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <div
            className={cn(
              "text-2xl transition-colors",
              selected === method.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            {method.icon}
          </div>
          <span className="text-xs font-medium">{method.label}</span>
        </button>
      ))}
    </div>
  )
}
