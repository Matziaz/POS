import React, { useEffect, useMemo, useState } from "react"
import type { SaleView } from "@interface/store/salesStore"
import { useSales } from "@interface/hooks/useSales"
import { SalesTable, SaleDetailDialog } from "@interface/components/sales"
import { CURRENCY_SYMBOL, DECIMAL_PLACES } from "@shared/constants"
import { Button } from "@interface/components/ui/button"

export const SalesPage: React.FC = () => {
  const {
    salesHistory,
    historyTotal,
    historyPage,
    historyPageSize,
    isLoading,
    error,
    fetchSalesHistory,
    clearError,
  } = useSales({ autoFetch: false })


  const [detailOpen, setDetailOpen] = useState(false)
  const [viewingSale, setViewingSale] = useState<SaleView | null>(null)

  useEffect(() => {
    void fetchSalesHistory(1, historyPageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Resumen ---
  const totalVentas = historyTotal
  const totalPages = Math.max(1, Math.ceil(historyTotal / historyPageSize))
  const currentRange = useMemo(() => {
    if (historyTotal === 0) return "0-0"
    const start = (historyPage - 1) * historyPageSize + 1
    const end = Math.min(historyPage * historyPageSize, historyTotal)
    return `${start}-${end}`
  }, [historyPage, historyPageSize, historyTotal])
  const totalIngresosPagina = salesHistory.reduce((acc, s) => acc + s.total, 0)
  const totalArticulosPagina = salesHistory.reduce(
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

  const handlePreviousPage = async () => {
    if (historyPage <= 1 || isLoading) return
    await fetchSalesHistory(historyPage - 1, historyPageSize)
  }

  const handleNextPage = async () => {
    if (historyPage >= totalPages || isLoading) return
    await fetchSalesHistory(historyPage + 1, historyPageSize)
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



      {!isLoading && historyTotal > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Mostrando {currentRange} de {historyTotal} ventas
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handlePreviousPage()}
              disabled={historyPage <= 1 || isLoading}
            >
              Anterior
            </Button>
            <span>
              Página {historyPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleNextPage()}
              disabled={historyPage >= totalPages || isLoading}
            >
              Siguiente
            </Button>
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
        sales={salesHistory}
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
