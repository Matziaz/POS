import React, { useEffect, useMemo, useState } from "react"
import { Button } from "@interface/components/ui/button"
import { Input } from "@interface/components/ui/input"

type CashClosureView = {
  id: string
  folio: string
  businessDate: string
  openedAt: string
  closedAt: string
  salesCount: number
  totalAmount: number
  isFinal: number
  userId: string | null
  notes: string | null
  createdAt: string
}

type CashClosureBreakdownView = {
  id: string
  cashClosureId: string
  paymentMethodId: string
  totalAmount: number
}

type CashClosurePrecloseAlertView = {
  businessDate: string
  triggeredAt: string
  message: string
}

function startOfDayISO(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
}

function endOfDayISO(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString()
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`
}

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return value
  }
}

export const CashClosurePage: React.FC = () => {
  const today = useMemo(() => new Date(), [])

  const [businessDate, setBusinessDate] = useState(today.toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")
  const [isClosing, setIsClosing] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [closures, setClosures] = useState<CashClosureView[]>([])
  const [lastBreakdown, setLastBreakdown] = useState<CashClosureBreakdownView[]>([])
  const [precloseAlert, setPrecloseAlert] = useState<CashClosurePrecloseAlertView | null>(null)

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true)
      setError(null)

      const from = new Date(today)
      from.setDate(from.getDate() - 30)

      const rows = await window.electronAPI?.cashClosureListByDateRange(
        startOfDayISO(from),
        endOfDayISO(today),
      )

      setClosures(rows ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar los cortes")
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    void loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const off = window.electronAPI?.onCashClosurePrecloseAlert?.((payload) => {
      setPrecloseAlert(payload)
      if (payload.businessDate) {
        setBusinessDate(payload.businessDate)
      }
    })

    return () => {
      off?.()
    }
  }, [])

  const handleCloseCash = async () => {
    try {
      setIsClosing(true)
      setError(null)
      setSuccess(null)

      const result = await window.electronAPI?.cashClosureClose({
        businessDate,
        notes: notes.trim() || undefined,
        isFinal: true,
      })

      if (!result) {
        throw new Error("No se recibió respuesta al generar el corte")
      }

      setLastBreakdown(result.breakdown)
      setSuccess(`Corte generado con folio ${result.closure.folio}`)
      setPrecloseAlert(null)
      setNotes("")
      await loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible generar el corte")
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Corte de caja</h1>
        <p className="mt-1 text-muted-foreground">
          Genera un cierre diario formal con folio, total vendido y cantidad de ventas.
        </p>
      </header>

      {(error || success) && (
        <div className={`mb-4 rounded-md p-3 text-sm ${error ? "bg-destructive/10 text-destructive" : "bg-emerald-100 text-emerald-700"}`}>
          {error ?? success}
        </div>
      )}

      <section className="mb-6 rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Generar corte</h2>

        {precloseAlert && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">Aviso de pre-cierre</p>
            <p>{precloseAlert.message}</p>
            <p className="mt-1 text-xs">
              Fecha de negocio: {precloseAlert.businessDate} | Detectado: {formatDateTime(precloseAlert.triggeredAt)}
            </p>
            <div className="mt-3">
              <Button onClick={handleCloseCash} disabled={isClosing} size="sm">
                {isClosing ? "Generando corte..." : "Confirmar cierre ahora"}
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Fecha de negocio</span>
            <Input
              type="date"
              value={businessDate}
              onChange={(event) => setBusinessDate(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-muted-foreground">Notas (opcional)</span>
            <Input
              type="text"
              placeholder="Observaciones del cierre"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleCloseCash} disabled={isClosing}>
            {isClosing ? "Generando corte..." : "Generar corte diario"}
          </Button>
          <Button variant="outline" onClick={() => void loadHistory()} disabled={isLoadingHistory}>
            Refrescar historial
          </Button>
        </div>

        {lastBreakdown.length > 0 && (
          <div className="mt-4 rounded-md border p-3">
            <h3 className="mb-2 text-sm font-semibold">Desglose del último corte</h3>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {lastBreakdown.map((row) => (
                <div key={row.id} className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <p className="font-medium uppercase">{row.paymentMethodId}</p>
                  <p className="text-muted-foreground">{formatMoney(row.totalAmount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Historial de cortes (30 días)</h2>

        {isLoadingHistory ? (
          <p className="text-sm text-muted-foreground">Cargando historial...</p>
        ) : closures.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay cortes registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-2">Folio</th>
                  <th className="py-2 pr-2">Fecha negocio</th>
                  <th className="py-2 pr-2">Ventas</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2 pr-2">Abierto</th>
                  <th className="py-2 pr-2">Cerrado</th>
                </tr>
              </thead>
              <tbody>
                {closures.map((closure) => (
                  <tr key={closure.id} className="border-b">
                    <td className="py-2 pr-2 font-mono text-xs">{closure.folio}</td>
                    <td className="py-2 pr-2">{closure.businessDate}</td>
                    <td className="py-2 pr-2">{closure.salesCount}</td>
                    <td className="py-2 pr-2 font-semibold">{formatMoney(closure.totalAmount)}</td>
                    <td className="py-2 pr-2">{formatDateTime(closure.openedAt)}</td>
                    <td className="py-2 pr-2">{formatDateTime(closure.closedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
