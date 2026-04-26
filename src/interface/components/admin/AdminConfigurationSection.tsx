import React, { useEffect, useState } from "react"
import { Settings } from "lucide-react"
import { Badge } from "@interface/components/ui/badge"
import { Button } from "@interface/components/ui/button"

interface AdminConfigurationSectionProps {
  onSave: (input: { retailContext: string; reminderTime: string; closureTime: string }) => Promise<void>
}

export const AdminConfigurationSection: React.FC<AdminConfigurationSectionProps> = ({
  onSave,
}) => {
  const [currentContext, setCurrentContext] = useState<string | null>(null)
  const [availableContexts, setAvailableContexts] = useState<string[]>([])
  const [selectedContext, setSelectedContext] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentReminderTime, setCurrentReminderTime] = useState<string>("23:45")
  const [reminderTime, setReminderTime] = useState<string>("23:45")
  const [currentClosureTime, setCurrentClosureTime] = useState<string>("23:59")
  const [closureTime, setClosureTime] = useState<string>("23:59")

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const electronAPI = window.electronAPI
        if (!electronAPI) throw new Error("Electron API no disponible")

        const [config, contexts, reminderConfig] = await Promise.all([
          electronAPI.configurationGet(),
          electronAPI.configurationListContexts(),
          electronAPI.cashClosureReminderConfigGet?.() ?? Promise.resolve({ reminderTime: "23:45", closureTime: "23:59" }),
        ])

        if (!active) return

        const normalized = contexts
          .map((c) => c.trim().toLowerCase())
          .filter((c, i, arr) => !!c && arr.indexOf(c) === i)

        setAvailableContexts(normalized)
        const active_ctx = config?.retailContext ?? normalized[0] ?? ""
        setCurrentContext(active_ctx)
        setSelectedContext(active_ctx)
        setCurrentReminderTime(reminderConfig.reminderTime)
        setReminderTime(reminderConfig.reminderTime)
        setCurrentClosureTime(reminderConfig.closureTime)
        setClosureTime(reminderConfig.closureTime)
      } catch (err) {
        if (!active) return
        setSubmitError(err instanceof Error ? err.message : "Error al cargar configuración")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => { active = false }
  }, [])

  const hasChanges = selectedContext !== currentContext || reminderTime !== currentReminderTime || closureTime !== currentClosureTime
  const canSubmit = hasChanges && selectedContext.length > 0 && reminderTime.length > 0 && closureTime.length > 0

  const handleSave = async () => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      await onSave({ retailContext: selectedContext, reminderTime, closureTime })
      setCurrentContext(selectedContext)
      setCurrentReminderTime(reminderTime)
      setCurrentClosureTime(closureTime)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo guardar la configuración")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Contexto activo</p>
        <p className="mt-2 text-2xl font-semibold capitalize">
          {isLoading ? "—" : (currentContext ?? "—")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {availableContexts.length} contexto{availableContexts.length !== 1 ? "s" : ""} disponible{availableContexts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm md:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Contexto de negocio
          </h3>
          <Badge variant="outline">Configuración de la aplicación</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          El contexto determina el comportamiento del sistema. Cambiarlo afectará la configuración activa.
        </p>

        {isLoading ? (
          <div className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Cargando configuración...
          </div>
        ) : availableContexts.length === 0 ? (
          <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            No hay contextos disponibles en la base de datos.
          </div>
        ) : availableContexts.length === 1 ? (
          <div className="mt-4 rounded-md border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Contexto único disponible:</p>
            <p className="mt-1 font-semibold capitalize">{availableContexts[0]}</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <p className="text-sm font-medium">Seleccionar contexto:</p>
            <div className="flex flex-wrap gap-2">
              {availableContexts.map((ctx) => (
                <Button
                  key={ctx}
                  type="button"
                  variant={selectedContext === ctx ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedContext(ctx)}
                  disabled={isSubmitting}
                  className="capitalize"
                >
                  {ctx}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-2 md:max-w-xs">
          <label className="text-sm font-medium">Hora de recordatorio de corte</label>
          <input
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
            disabled={isSubmitting}
            className="h-10 rounded-md border bg-background px-3"
          />
          <p className="text-xs text-muted-foreground">
            Se mostrará una notificación global en todo el sistema cuando llegue esta hora.
          </p>
        </div>

        <div className="mt-4 grid gap-2 md:max-w-xs">
          <label className="text-sm font-medium">Hora de corte para auditoría</label>
          <input
            type="time"
            value={closureTime}
            onChange={(event) => setClosureTime(event.target.value)}
            disabled={isSubmitting}
            className="h-10 rounded-md border bg-background px-3"
          />
          <p className="text-xs text-muted-foreground">
            Cuando se cierre después de esta hora, el sistema lo marcará como corte atrasado en notes.
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => { void handleSave() }}
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>

        {submitError && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </div>
        )}
      </div>
    </div>
  )
}
