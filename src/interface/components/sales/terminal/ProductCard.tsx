import React from "react"
import { Package } from "lucide-react"
import type { ProductProps } from "@core/entities"
import { Badge } from "@interface/components/ui/badge"
import { Button } from "@interface/components/ui/button"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import { cn } from "@interface/lib/utils"

interface ProductCardProps {
  product: ProductProps
  inTicket: boolean
  onAdd: (product: ProductProps) => void
}

const getStockClassName = (stock: number): string => {
  if (stock <= 0) return "text-red-600"
  if (stock <= 10) return "text-amber-600"
  return "text-emerald-600"
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  inTicket,
  onAdd,
}) => {
  const outOfStock = product.stock <= 0

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 transition-colors",
        outOfStock ? "opacity-60" : "hover:border-primary/40",
        inTicket ? "border-primary/50" : ""
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <Badge variant="secondary">SKU {product.sku}</Badge>
        {inTicket && <Badge>En ticket</Badge>}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="text-xs text-muted-foreground">{CURRENCY_SYMBOL}{product.price.toFixed(DECIMAL_PLACES)}</p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Stock</span>
        <span className={cn("text-xs font-semibold", getStockClassName(product.stock))}>
          {product.stock}
        </span>
      </div>

      <Button
        type="button"
        size="sm"
        className="w-full"
        disabled={outOfStock}
        onClick={() => onAdd(product)}
      >
        {outOfStock ? "Sin stock" : "Agregar"}
      </Button>
    </div>
  )
}
