import React, { useMemo } from "react"
import { AlertTriangle, BarChart3, Package, Receipt, Wallet } from "lucide-react"
import { useProducts } from "@interface/hooks/useProducts"
import { useSales } from "@interface/hooks/useSales"
import { Badge } from "@interface/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@interface/components/ui/table"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"

const LOW_STOCK_THRESHOLD = 5

interface TopProductRow {
  productId: string
  productName: string
  quantity: number
  revenue: number
}

function formatMoney(value: number): string {
  return `${CURRENCY_SYMBOL}${value.toFixed(DECIMAL_PLACES)}`
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function endOfToday(): Date {
  const start = startOfToday()
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-md bg-muted p-2 text-muted-foreground">{icon}</div>
      </div>
    </div>
  )
}

export const DashboardPage: React.FC = () => {
  const {
    sales,
    isLoading: isLoadingSales,
    error: salesError,
  } = useSales()

  const {
    products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts()

  const todaySales = useMemo(() => {
    const from = startOfToday().getTime()
    const to = endOfToday().getTime()
    return sales.filter((sale) => {
      const createdAt = new Date(sale.createdAt).getTime()
      return createdAt >= from && createdAt < to
    })
  }, [sales])

  const ticketsCount = todaySales.length
  const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const averageTicket = ticketsCount > 0 ? totalRevenue / ticketsCount : 0

  const topProducts = useMemo<TopProductRow[]>(() => {
    const byProduct = new Map<string, TopProductRow>()

    for (const sale of todaySales) {
      for (const item of sale.items) {
        const existing = byProduct.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.lineTotal
          continue
        }

        byProduct.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          revenue: item.lineTotal,
        })
      }
    }

    return Array.from(byProduct.values())
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 5)
  }, [todaySales])

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name))
  }, [products])

  const isLoading = isLoadingSales || isLoadingProducts
  const error = salesError ?? productsError

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Resumen operativo del dia para ventas e inventario.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Ventas de hoy"
          value={formatMoney(totalRevenue)}
          icon={<Wallet className="h-4 w-4" />}
        />
        <MetricCard
          label="Tickets de hoy"
          value={ticketsCount}
          icon={<Receipt className="h-4 w-4" />}
        />
        <MetricCard
          label="Ticket promedio"
          value={formatMoney(averageTicket)}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <MetricCard
          label="Productos bajos"
          value={lowStockProducts.length}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          label="Productos activos"
          value={products.length}
          icon={<Package className="h-4 w-4" />}
        />
      </section>

      {isLoading && (
        <div className="mb-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top 5 productos vendidos</h2>
              <Badge variant="secondary">Hoy</Badge>
            </div>

            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aun no hay ventas registradas hoy.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Ingreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatMoney(item.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Productos con bajo stock</h2>
              <Badge variant="outline">Umbral: {LOW_STOCK_THRESHOLD}</Badge>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay productos en riesgo de desabasto.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Actualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDateTime(product.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
