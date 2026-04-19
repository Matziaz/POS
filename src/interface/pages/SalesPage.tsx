import React, { useEffect, useMemo, useState } from "react"
import type { SaleView } from "@interface/store/salesStore"
import { useSales } from "@interface/hooks/useSales"
import { SalesTable, SaleDetailDialog } from "@interface/components/sales"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"

function toDateTimeLocal(iso?: string): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  const pad = (n: number) => String(n).padStart(2, "0")
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toISOFromLocal(localDateTime?: string): string | undefined {
  if (!localDateTime?.trim()) return undefined
  const parsed = new Date(localDateTime)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString()
}

export const SalesPage: React.FC = () => {
  const {
    salesHistory,
    historyTotal,
    historyPage,
    historyPageSize,
    historyFilters,
    isLoading,
    error,
    fetchSalesHistory,
    clearError,
  } = useSales({ autoFetch: false })


  const [detailOpen, setDetailOpen] = useState(false)
  const [viewingSale, setViewingSale] = useState<SaleView | null>(null)
  const [fromLocal, setFromLocal] = useState("")
  const [toLocal, setToLocal] = useState("")
  const [filtersError, setFiltersError] = useState<string | null>(null)

  useEffect(() => {
    void fetchSalesHistory(1, historyPageSize, historyFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setFromLocal(toDateTimeLocal(historyFilters.fromISO))
    setToLocal(toDateTimeLocal(historyFilters.toISO))
  }, [historyFilters.fromISO, historyFilters.toISO])

  // --- Resumen ---
  const totalPages = Math.max(1, Math.ceil(historyTotal / historyPageSize))
  const hasActiveFilters = Boolean(historyFilters.fromISO || historyFilters.toISO)
  const currentRange = useMemo(() => {
    if (historyTotal === 0) return "0-0"
    const start = (historyPage - 1) * historyPageSize + 1
    const end = Math.min(historyPage * historyPageSize, historyTotal)
    return `${start}-${end}`
  }, [historyPage, historyPageSize, historyTotal])

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
    await fetchSalesHistory(historyPage - 1, historyPageSize, historyFilters)
  }

  const handleNextPage = async () => {
    if (historyPage >= totalPages || isLoading) return
    await fetchSalesHistory(historyPage + 1, historyPageSize, historyFilters)
  }

  const handleApplyFilters = async () => {
    const fromISO = toISOFromLocal(fromLocal)
    const toISO = toISOFromLocal(toLocal)

    if (fromLocal && !fromISO) {
      setFiltersError("La fecha/hora inicial no es valida")
      return
    }

    if (toLocal && !toISO) {
      setFiltersError("La fecha/hora final no es valida")
      return
    }

    if (fromISO && toISO && new Date(fromISO).getTime() >= new Date(toISO).getTime()) {
      setFiltersError("La fecha inicial debe ser menor a la final")
      return
    }

    setFiltersError(null)
    clearError()
    await fetchSalesHistory(1, historyPageSize, { fromISO, toISO })
  }

  const handleClearFilters = async () => {
    setFromLocal("")
    setToLocal("")
    setFiltersError(null)
    clearError()
    await fetchSalesHistory(1, historyPageSize, {})
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

      <div className="mb-4 rounded-md border p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="sales-filter-from" className="text-sm font-medium">
              Desde
            </label>
            <Input
              id="sales-filter-from"
              type="datetime-local"
              value={fromLocal}
              onChange={(e) => setFromLocal(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="sales-filter-to" className="text-sm font-medium">
              Hasta
            </label>
            <Input
              id="sales-filter-to"
              type="datetime-local"
              value={toLocal}
              onChange={(e) => setToLocal(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={() => void handleApplyFilters()} disabled={isLoading}>
              Aplicar filtros
            </Button>
            <Button variant="outline" onClick={() => void handleClearFilters()} disabled={isLoading}>
              Limpiar
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <p className="mt-3 text-xs text-muted-foreground">
            Filtros activos en paginacion: {historyFilters.fromISO ? "desde" : "sin fecha inicial"} / {historyFilters.toISO ? "hasta" : "sin fecha final"}
          </p>
        )}

        {filtersError && (
          <p className="mt-2 text-sm text-destructive">{filtersError}</p>
        )}
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
