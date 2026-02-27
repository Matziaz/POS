import React from "react"
import { Eye, ShoppingCart } from "lucide-react"
import type { SaleView } from "@interface/store/salesStore"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@interface/components/ui/table"
import { Button } from "@interface/components/ui/button"
import { Badge } from "@interface/components/ui/badge"

interface SalesTableProps {
  sales: SaleView[]
  isLoading: boolean
  onViewDetail: (sale: SaleView) => void
}

function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(DECIMAL_PLACES)}`
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <ShoppingCart className="h-12 w-12 mb-4" />
      <p className="text-lg font-medium">No hay ventas registradas</p>
      <p className="text-sm mt-1">Las ventas aparecerán aquí cuando se registren</p>
    </div>
  )
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  isLoading,
  onViewDetail,
}) => {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (sales.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead className="text-center">Productos</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-mono text-sm">
                {sale.id.length > 12 ? `${sale.id.slice(0, 12)}...` : sale.id}
              </TableCell>
              <TableCell>{formatDate(sale.createdAt)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatTime(sale.createdAt)}
              </TableCell>
              <TableCell className="text-sm">{sale.userId}</TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">
                  {sale.items.length} {sale.items.length === 1 ? "artículo" : "artículos"}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatPrice(sale.total)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetail(sale)}
                  title="Ver detalle"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
