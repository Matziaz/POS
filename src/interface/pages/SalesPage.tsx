import React, { useState } from "react"
import type { SaleView } from "@interface/store/salesStore"
import { useSales } from "@interface/hooks/useSales"
import { SalesTable, SaleDetailDialog } from "@interface/components/sales"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import { Button } from "@interface/components/ui/button"

export const SalesPage: React.FC = () => {
  const {
    sales,
    isLoading,
    error,
    clearError,
  } = useSales()

  const [detailOpen, setDetailOpen] = useState(false)
  const [viewingSale, setViewingSale] = useState<SaleView | null>(null)

  // --- Resumen ---
  const totalVentas = sales.length
  const totalIngresos = sales.reduce((acc, s) => acc + s.total, 0)
  const totalArticulos = sales.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  )

  // --- Handlers ---
  const handleViewDetail = (sale: SaleView) => {
    setViewingSale(sale)
    setDetailOpen(true)
  }

  const handleDetailClose = () => {
    setDetailOpen(false)
    setViewingSale(null)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground mt-1">
            Historial de ventas registradas
          </p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      {!isLoading && sales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de ventas</p>
            <p className="text-2xl font-bold mt-1">{totalVentas}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Ingresos totales</p>
            <p className="text-2xl font-bold mt-1">
              {CURRENCY_SYMBOL}{totalIngresos.toFixed(DECIMAL_PLACES)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Artículos vendidos</p>
            <p className="text-2xl font-bold mt-1">{totalArticulos}</p>
          </div>
        </div>
      )}

      {/* Error del store */}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Cerrar
          </Button>
        </div>
      )}

      {/* Tabla de ventas */}
      <SalesTable
        sales={sales}
        isLoading={isLoading}
        onViewDetail={handleViewDetail}
      />

      {/* Modal: Detalle de venta */}
      <SaleDetailDialog
        open={detailOpen}
        sale={viewingSale}
        onClose={handleDetailClose}
      />
    </div>
  )
}
