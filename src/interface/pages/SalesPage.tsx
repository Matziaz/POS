import React, { useState } from "react"
import { Plus } from "lucide-react"
import type { SaleView } from "@interface/store/salesStore"
import { useSales } from "@interface/hooks/useSales"
import { useProducts } from "@interface/hooks/useProducts"
import { SalesTable, SaleDetailDialog, SaleForm } from "@interface/components/sales"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import { Button } from "@interface/components/ui/button"

export const SalesPage: React.FC = () => {
  const {
    sales,
    isLoading,
    error,
    registerSale,
    clearError,
  } = useSales()

  const { products, refetch: refetchProducts } = useProducts()

  const [detailOpen, setDetailOpen] = useState(false)
  const [viewingSale, setViewingSale] = useState<SaleView | null>(null)
  const [formOpen, setFormOpen] = useState(false)

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

  const handleRegisterSale = async (lines: { productSku: string; qty: number }[]) => {
    await registerSale(lines)
    await refetchProducts()
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
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Venta
        </Button>
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

      {/* Modal: Registrar venta */}
      <SaleForm
        open={formOpen}
        products={products}
        onClose={() => setFormOpen(false)}
        onSubmit={handleRegisterSale}
      />
    </div>
  )
}
