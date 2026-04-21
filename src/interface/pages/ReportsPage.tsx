import React, { useMemo } from "react"
import { AlertTriangle, BarChart3, Package, Receipt, Wallet } from "lucide-react"
import { useProducts } from "@interface/hooks/useProducts"
import { useSales } from "@interface/hooks/useSales"
import { Badge } from "@interface/components/ui/badge"
import { Button } from "@interface/components/ui/button"
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

type ReportPeriod = "today" | "last7" | "last30"

const REPORT_PERIODS: Array<{ id: ReportPeriod; label: string; badge: string }> = [
  { id: "today", label: "Hoy", badge: "Hoy" },
  { id: "last7", label: "Ultimos 7 dias", badge: "7d" },
  { id: "last30", label: "Ultimos 30 dias", badge: "30d" },
]

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

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function getPeriodRange(period: ReportPeriod): { from: Date; to: Date } {
  const to = addDays(startOfToday(), 1)

  if (period === "today") {
    return { from: startOfToday(), to }
  }

  if (period === "last7") {
    return { from: addDays(to, -7), to }
  }

  return { from: addDays(to, -30), to }
}

function getPeriodEmptyText(period: ReportPeriod): string {
  if (period === "today") return "Aun no hay ventas registradas hoy."
  if (period === "last7") return "Aun no hay ventas registradas en los ultimos 7 dias."
  return "Aun no hay ventas registradas en los ultimos 30 dias."
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

export const ReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = React.useState<ReportPeriod>("today")

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

  const periodRange = useMemo(() => getPeriodRange(selectedPeriod), [selectedPeriod])

  const periodSales = useMemo(() => {
    const from = periodRange.from.getTime()
    const to = periodRange.to.getTime()

    return sales.filter((sale) => {
      const createdAt = new Date(sale.createdAt).getTime()
      return createdAt >= from && createdAt < to
    })
  }, [sales, periodRange])

  const ticketsCount = periodSales.length
  const totalRevenue = periodSales.reduce((sum, sale) => sum + sale.total, 0)
  const averageTicket = ticketsCount > 0 ? totalRevenue / ticketsCount : 0
  const totalUnitsSold = periodSales.reduce(
    (sum, sale) => sum + sale.items.reduce((inner, item) => inner + item.quantity, 0),
    0
  )
  const topProducts = useMemo<TopProductRow[]>(() => {
    const byProduct = new Map<string, TopProductRow>()

    for (const sale of periodSales) {
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
      .slice(0, 10)
  }, [periodSales])

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name))
  }, [products])

  const periodLabel =
    REPORT_PERIODS.find((period) => period.id === selectedPeriod)?.badge ?? "Hoy"

  const isLoading = isLoadingSales || isLoadingProducts
  const error = salesError ?? productsError

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
            <p className="mt-1 text-muted-foreground">
              Estadisticas simples para decision operativa diaria.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {REPORT_PERIODS.map((period) => (
              <Button
                key={period.id}
                type="button"
                size="sm"
                variant={selectedPeriod === period.id ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period.id)}
              >
                {period.label}
              </Button>
            ))}
            <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const fecha = new Date().toLocaleDateString("es-MX")
              const rows = [
                [`RESUMEN - ${periodLabel} - ${fecha}`],
                ["Ingresos", formatMoney(totalRevenue)],
                ["Transacciones", String(ticketsCount)],
                ["Ticket promedio", formatMoney(averageTicket)],
                ["Unidades vendidas", String(totalUnitsSold)],
                [],
                ["TOP PRODUCTOS"],
                ["Producto", "Cantidad vendida", "Ingreso"],
                ...topProducts.map((p) => [p.productName, String(p.quantity), formatMoney(p.revenue)]),
                [],
                ["BAJO STOCK"],
                ["SKU", "Producto", "Stock"],
                ...lowStockProducts.map((p) => [p.sku, p.name, String(p.stock)]),
              ]
            const csv = rows.map((r) => r.join(",")).join("\n")
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `reporte-${periodLabel}-${new Date().toISOString().slice(0, 10)}.csv`
            link.click()
            URL.revokeObjectURL(url)
                }}
            >
              Exportar Excel
            </Button>

          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="mb-3 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        Interpreta siempre el ticket promedio junto con el numero de transacciones para evitar
        conclusiones sesgadas.
      </section>

      <div className="mb-6 space-y-4">
  <div>
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ventas</p>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Ingresos del periodo" value={formatMoney(totalRevenue)} icon={<Wallet className="h-4 w-4" />} />
      <MetricCard label="Transacciones" value={ticketsCount} icon={<Receipt className="h-4 w-4" />} />
      <MetricCard label="Ticket promedio" value={formatMoney(averageTicket)} icon={<BarChart3 className="h-4 w-4" />} />
      <MetricCard label="Unidades vendidas" value={totalUnitsSold} icon={<Receipt className="h-4 w-4" />} />
    </div>
  </div>
  <div>
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Inventario</p>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCard label="Productos activos" value={products.length} icon={<Package className="h-4 w-4" />} />
      <MetricCard label="Top productos" value={topProducts.length} icon={<BarChart3 className="h-4 w-4" />} />
      <MetricCard label="Productos bajo stock" value={lowStockProducts.length} icon={<AlertTriangle className="h-4 w-4" />} />
    </div>
  </div>
</div>

      {isLoading && (
        <div className="mb-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top productos por ventas</h2>
              <Badge variant="secondary">{periodLabel}</Badge>
            </div>

            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{getPeriodEmptyText(selectedPeriod)}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad vendida</TableHead>
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
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Productos con bajo stock</h2>
              <Badge variant="outline">Umbral: {LOW_STOCK_THRESHOLD}</Badge>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay productos en riesgo de desabasto.</p>
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
          </section>
        </div>
      )}
    </div>
  )
}
