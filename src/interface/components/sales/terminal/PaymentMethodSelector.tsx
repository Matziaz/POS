import React from "react"
import { CreditCard, Banknote, DollarSign, Tag,  Wallet  } from "lucide-react"
import { cn } from "@interface/lib/utils"

export type PaymentMethod = string

export interface PaymentMethodFromDB {
  id: string
  method: string
  isCash: number
  isActive: number
  displayOrder: number | null
}

interface PaymentMethodSelectorProps {
  selected: string | null
  onSelect: (method: PaymentMethod) => void
  disabled?: boolean
  methods: PaymentMethodFromDB[]
}

const methodConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  cash: { label: "Efectivo", icon: <Banknote className="h-6 w-6" /> },
  card: { label: "Tarjeta", icon: <CreditCard className="h-6 w-6" /> },
  transfer: { label: "Transferencia", icon: <DollarSign className="h-6 w-6" /> },
  voucher: { label: "Vales", icon: <Tag className="h-6 w-6" /> },
}

const defaultIcon = <Wallet className="h-6 w-6" />

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
  disabled = false,
  methods,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {methods.map((method) => {
        const config = methodConfig[method.method] ?? {
          label: method.method,
          icon: defaultIcon,
        }
        return (
          <button
            key={method.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(method.id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
              selected === method.id
                ? "border-primary bg-primary/10"
                : "border-border bg-background hover:border-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <div
              className={cn(
                "text-2xl transition-colors",
                selected === method.id ? "text-primary" : "text-muted-foreground"
              )}
            >
              {config.icon}
            </div>
            <span className="text-xs font-medium">{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}