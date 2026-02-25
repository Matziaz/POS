import React from "react"
import type { SaleView } from "@interface/store/salesStore"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@interface/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@interface/components/ui/table"
import { Badge } from "@interface/components/ui/badge"

interface SaleDetailDialogProps {
  open: boolean
  sale: SaleView | null
  onClose: () => void
}

function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(DECIMAL_PLACES)}`
}

function formatDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export const SaleDetailDialog: React.FC<SaleDetailDialogProps> = ({
  open,
  sale,
  onClose,
}) => {
  if (!sale) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Detalle de Venta</DialogTitle>
          <DialogDescription>
            Venta registrada el {formatDateTime(sale.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {/* Info general */}
        <div className="grid grid-cols-2 gap-4 py-2 text-sm">
          <div>
            <span className="text-muted-foreground">ID:</span>{" "}
            <span className="font-mono">{sale.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Usuario:</span>{" "}
            <span>{sale.userId}</span>
          </div>
        </div>

        {/* Tabla de artículos */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cant.</TableHead>
                <TableHead className="text-right">Precio unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.productName}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{item.quantity}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.lineTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-lg font-bold">{formatPrice(sale.total)}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
