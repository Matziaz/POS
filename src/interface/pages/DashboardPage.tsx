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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"

const LOW_STOCK_THRESHOLD = 5

type DashboardPeriod = "today" | "last7" | "last30"

const DASHBOARD_PERIODS: Array<{ id: DashboardPeriod; label: string; badge: string }> = [
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

interface DailySalesPoint {
  key: string
  label: string
  revenue: number
  tickets: number
}

interface HourlySalesPoint {
  hour: string
  revenue: number
  tickets: number
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

function getPeriodRange(period: DashboardPeriod): { from: Date; to: Date } {
  const to = addDays(startOfToday(), 1)

  if (period === "today") {
    return { from: startOfToday(), to }
  }

  if (period === "last7") {
    return { from: addDays(to, -7), to }
  }

  return { from: addDays(to, -30), to }
}

function getPeriodEmptyText(period: DashboardPeriod): string {
  if (period === "today") return "Aun no hay ventas registradas hoy."
  if (period === "last7") return "Aun no hay ventas registradas en los ultimos 7 dias."
  return "Aun no hay ventas registradas en los ultimos 30 dias."
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
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
  const [selectedPeriod, setSelectedPeriod] = React.useState<DashboardPeriod>("today")

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
      .slice(0, 5)
  }, [periodSales])

  const periodLabel =
    DASHBOARD_PERIODS.find((period) => period.id === selectedPeriod)?.badge ?? "Hoy"

  const dailySalesData = useMemo<DailySalesPoint[]>(() => {
    const revenueByDay = new Map<string, number>()
    const ticketsByDay = new Map<string, number>()

    for (const sale of periodSales) {
      const created = new Date(sale.createdAt)
      const key = toDateKey(created)

      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + sale.total)
      ticketsByDay.set(key, (ticketsByDay.get(key) ?? 0) + 1)
    }

    const points: DailySalesPoint[] = []
    let cursor = new Date(periodRange.from)

    while (cursor.getTime() < periodRange.to.getTime()) {
      const key = toDateKey(cursor)
      points.push({
        key,
        label: formatDayLabel(cursor),
        revenue: revenueByDay.get(key) ?? 0,
        tickets: ticketsByDay.get(key) ?? 0,
      })
      cursor = addDays(cursor, 1)
    }

    return points
  }, [periodSales, periodRange])

  const hourlySalesData = useMemo<HourlySalesPoint[]>(() => {
    const buckets = Array.from({ length: 24 }, (_, index) => ({
      hour: `${index.toString().padStart(2, "0")}:00`,
      revenue: 0,
      tickets: 0,
    }))

    for (const sale of periodSales) {
      const hour = new Date(sale.createdAt).getHours()
      buckets[hour].revenue += sale.total
      buckets[hour].tickets += 1
    }

    return buckets
  }, [periodSales])

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Resumen operativo para ventas e inventario.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {DASHBOARD_PERIODS.map((period) => (
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
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Ventas del periodo"
          value={formatMoney(totalRevenue)}
          icon={<Wallet className="h-4 w-4" />}
        />
        <MetricCard
          label="Tickets del periodo"
          value={ticketsCount}
          icon={<Receipt className="h-4 w-4" />}
        />
        <MetricCard
          label="Ticket promedio"
          value={formatMoney(averageTicket)}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <MetricCard
          label="Unidades vendidas"
          value={totalUnitsSold}
          icon={<Receipt className="h-4 w-4" />}
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
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tendencia de ventas por dia</h2>
                <Badge variant="secondary">{periodLabel}</Badge>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySalesData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value: number) => `${CURRENCY_SYMBOL}${Math.round(value)}`} tickLine={false} axisLine={false} width={70} />
                    <Tooltip
                      formatter={(value: number) => formatMoney(value)}
                      labelFormatter={(label) => `Dia: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Ventas por hora</h2>
                <Badge variant="secondary">{periodLabel}</Badge>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlySalesData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="hour"
                      tickLine={false}
                      axisLine={false}
                      ticks={["00:00", "06:00", "12:00", "18:00", "23:00"]}
                    />
                    <YAxis tickFormatter={(value: number) => `${CURRENCY_SYMBOL}${Math.round(value)}`} tickLine={false} axisLine={false} width={70} />
                    <Tooltip
                      formatter={(value: number) => formatMoney(value)}
                      labelFormatter={(label) => `Hora: ${label}`}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Top 5 productos vendidos</h2>
                <Badge variant="secondary">{periodLabel}</Badge>
              </div>

              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {getPeriodEmptyText(selectedPeriod)}
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
        </div>
      )}
    </div>
  )
}
