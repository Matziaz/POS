import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, RotateCcw } from "lucide-react"
import { Button } from "@interface/components/ui/button"
import { Badge } from "@interface/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@interface/components/ui/dialog"
import { cn } from "@interface/lib/utils"
import type { SaleHistoryFilters } from "@interface/store/salesStore"

type TimeFormat = "12h" | "24h"
type RangeEndpoint = "from" | "to"

interface SalesDateTimeRangePickerProps {
  value: SaleHistoryFilters
  onApply: (filters: SaleHistoryFilters) => Promise<void> | void
  onClear: () => Promise<void> | void
  disabled?: boolean
}

const WEEKDAY_LABELS = ["do.", "lu.", "ma.", "mi.", "ju.", "vi.", "sá."]

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime())
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0, 0)
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

function addMonths(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function isBeforeDay(left: Date, right: Date): boolean {
  return startOfDay(left).getTime() < startOfDay(right).getTime()
}

function parseISODate(value?: string): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return isValidDate(parsed) ? parsed : null
}

function formatDateTime(date: Date | null): string {
  if (!date) return "Sin definir"
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function formatTriggerSummary(value: SaleHistoryFilters): string {
  const from = parseISODate(value.fromISO)
  const to = parseISODate(value.toISO)

  if (!from || !to) return "Filtrar ventas por fecha y hora"

  return `${formatDateTime(from)} - ${formatDateTime(to)}`
}

function formatClockTime(date: Date, timeFormat: TimeFormat): string {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: timeFormat === "12h",
  })
}

function setTimeOnDate(date: Date, hour: number, minute: number): Date {
  const next = new Date(date)
  next.setHours(hour, minute, 0, 0)
  return next
}

function toDateTimeISO(date: Date): string {
  return date.toISOString()
}

function get12HourFrom24Hour(hour: number): number {
  const normalized = hour % 12
  return normalized === 0 ? 12 : normalized
}

function get24HourFrom12Hour(hour: number, meridiem: "AM" | "PM"): number {
  if (meridiem === "AM") {
    return hour === 12 ? 0 : hour
  }

  return hour === 12 ? 12 : hour + 12
}

function TimeCard({
  label,
  value,
  use24h,
  onChange,
}: {
  label: string
  value: Date
  use24h: boolean
  onChange: (nextValue: Date) => void
}) {
  const hourOptions = useMemo(() => {
    if (use24h) {
      return Array.from({ length: 24 }, (_, index) => pad(index))
    }

    return Array.from({ length: 12 }, (_, index) => pad(index + 1))
  }, [use24h])

  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, index) => pad(index)), [])

  const displayHour = use24h ? pad(value.getHours()) : pad(get12HourFrom24Hour(value.getHours()))
  const displayMinute = pad(value.getMinutes())
  const meridiem: "AM" | "PM" = value.getHours() >= 12 ? "PM" : "AM"

  const handleHourChange = (nextHourString: string) => {
    const nextHour = Number(nextHourString)
    if (!Number.isFinite(nextHour)) return

    const normalizedHour = use24h ? nextHour : get24HourFrom12Hour(nextHour, meridiem)
    onChange(setTimeOnDate(value, normalizedHour, value.getMinutes()))
  }

  const handleMinuteChange = (nextMinuteString: string) => {
    const nextMinute = Number(nextMinuteString)
    if (!Number.isFinite(nextMinute)) return

    onChange(setTimeOnDate(value, value.getHours(), nextMinute))
  }

  const handleMeridiemChange = (nextMeridiem: "AM" | "PM") => {
    const hour12 = get12HourFrom24Hour(value.getHours())
    const nextHour = get24HourFrom12Hour(hour12, nextMeridiem)
    onChange(setTimeOnDate(value, nextHour, value.getMinutes()))
  }

  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{formatClockTime(value, use24h ? "24h" : "12h")}</p>
        </div>
        <Badge variant="outline">{use24h ? "24h" : "12h"}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Hora</label>
          <select
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "appearance-none"
            )}
            value={displayHour}
            onChange={(event) => handleHourChange(event.target.value)}
          >
            {hourOptions.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Minuto</label>
          <select
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "appearance-none"
            )}
            value={displayMinute}
            onChange={(event) => handleMinuteChange(event.target.value)}
          >
            {minuteOptions.map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!use24h && (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-muted/30 p-1">
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              meridiem === "AM" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => handleMeridiemChange("AM")}
          >
            a. m.
          </button>
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              meridiem === "PM" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => handleMeridiemChange("PM")}
          >
            p. m.
          </button>
        </div>
      )}
    </div>
  )
}

export function SalesDateTimeRangePicker({ value, onApply, onClear, disabled }: SalesDateTimeRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState<Date>(() => {
    const initial = parseISODate(value.fromISO)
    return initial ?? startOfDay(new Date())
  })
  const [draftTo, setDraftTo] = useState<Date>(() => {
    const initial = parseISODate(value.toISO)
    return initial ?? endOfDay(new Date())
  })
  const [selectionAnchor, setSelectionAnchor] = useState<RangeEndpoint>("from")
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h")
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    const nextFrom = parseISODate(value.fromISO) ?? startOfDay(new Date())
    const nextTo = parseISODate(value.toISO) ?? endOfDay(new Date())
    setDraftFrom(nextFrom)
    setDraftTo(nextTo)
    setSelectionAnchor("from")
    setCurrentMonth(startOfMonth(nextFrom ?? nextTo ?? new Date()))
    setLocalError(null)
  }, [open, value.fromISO, value.toISO])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const gridStart = addDays(monthStart, -monthStart.getDay())

    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  }, [currentMonth])

  const fromDay = startOfDay(draftFrom)
  const toDay = startOfDay(draftTo)
  const hasAppliedFilters = Boolean(value.fromISO || value.toISO)

  const handleDayClick = (date: Date) => {
    const clicked = startOfDay(date)

    if (selectionAnchor === "from") {
      setDraftFrom(setTimeOnDate(clicked, 0, 0))
      setDraftTo(setTimeOnDate(clicked, 23, 59))
      setSelectionAnchor("to")
      setCurrentMonth(startOfMonth(clicked))
      setLocalError(null)
      return
    }

    if (isBeforeDay(clicked, fromDay)) {
      setDraftTo(setTimeOnDate(fromDay, 23, 59))
      setDraftFrom(setTimeOnDate(clicked, 0, 0))
    } else {
      setDraftTo(setTimeOnDate(clicked, 23, 59))
    }

    setSelectionAnchor("from")
    setCurrentMonth(startOfMonth(clicked))
    setLocalError(null)
  }

  const handleApply = async () => {
    if (!draftFrom || !draftTo) {
      setLocalError("Selecciona un rango de fechas para aplicar el filtro")
      return
    }

    if (draftFrom.getTime() >= draftTo.getTime()) {
      setLocalError("La fecha inicial debe ser menor a la final")
      return
    }

    try {
      setIsSubmitting(true)
      setLocalError(null)
      await Promise.resolve(
        onApply({
          fromISO: toDateTimeISO(draftFrom),
          toISO: toDateTimeISO(draftTo),
        })
      )
      setOpen(false)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "No fue posible aplicar el filtro")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = async () => {
    try {
      setIsSubmitting(true)
      setLocalError(null)
      await Promise.resolve(onClear())
      setDraftFrom(startOfDay(new Date()))
      setDraftTo(endOfDay(new Date()))
      setSelectionAnchor("from")
      setCurrentMonth(startOfMonth(new Date()))
      setOpen(false)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "No fue posible limpiar el filtro")
    } finally {
      setIsSubmitting(false)
    }
  }

  const applyPreset = (preset: "today" | "24h" | "7d") => {
    const now = new Date()

    if (preset === "today") {
      const start = startOfDay(now)
      const end = endOfDay(now)
      setDraftFrom(start)
      setDraftTo(end)
      setCurrentMonth(startOfMonth(start))
    }

    if (preset === "24h") {
      const end = now
      const start = new Date(now)
      start.setDate(start.getDate() - 1)
      setDraftFrom(start)
      setDraftTo(end)
      setCurrentMonth(startOfMonth(start))
    }

    if (preset === "7d") {
      const end = now
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      setDraftFrom(start)
      setDraftTo(end)
      setCurrentMonth(startOfMonth(start))
    }

    setSelectionAnchor("from")
    setLocalError(null)
  }

  const summaryText = formatTriggerSummary(value)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-3 border-dashed px-4 py-3 text-left shadow-sm transition-all",
            "hover:border-primary hover:bg-primary/5",
            disabled && "pointer-events-none opacity-60"
          )}
          disabled={disabled}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Rango de filtros
            </span>
            <span className="truncate text-sm font-medium text-foreground">{summaryText}</span>
          </div>
          <Badge variant={hasAppliedFilters ? "default" : "outline"} className="shrink-0">
            {hasAppliedFilters ? "Activo" : "Sin filtro"}
          </Badge>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl overflow-hidden p-0 sm:max-h-[90vh]">
        <div className="flex max-h-[90vh] flex-col">
          <div className="border-b bg-gradient-to-r from-primary/10 via-background to-background px-6 py-5">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Filtros de fecha y hora</Badge>
                <Badge variant={hasAppliedFilters ? "default" : "outline"}>
                  {hasAppliedFilters ? "Filtro activo" : "Sin filtro activo"}
                </Badge>
              </div>
              <DialogTitle className="text-2xl">Panel de rango temporal</DialogTitle>
              <DialogDescription>
                Selecciona una fecha de inicio y una de fin con calendario y reloj, sin perder la paginación del historial.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid gap-6 overflow-y-auto p-6 lg:grid-cols-[1.25fr_0.95fr]">
            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Calendario</p>
                  <p className="text-xs text-muted-foreground">Haz clic en una fecha para empezar o ajustar el rango.</p>
                </div>
                <div className="inline-flex rounded-xl border bg-background p-1 shadow-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentMonth((current) => addMonths(current, -1))}
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentMonth((current) => addMonths(current, 1))}
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="outline">Inicio: {formatDateTime(draftFrom)}</Badge>
                <Badge variant="outline">Fin: {formatDateTime(draftTo)}</Badge>
                <Badge variant="secondary">{selectionAnchor === "from" ? "Selecciona inicio" : "Selecciona fin"}</Badge>
              </div>

              <div className="mb-3 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {WEEKDAY_LABELS.map((weekday) => (
                  <div key={weekday} className="py-2">
                    {weekday}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date) => {
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                  const isStart = isSameDay(date, fromDay)
                  const isEnd = isSameDay(date, toDay)
                  const isInRange = date.getTime() >= fromDay.getTime() && date.getTime() <= toDay.getTime()

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => handleDayClick(date)}
                      className={cn(
                        "flex h-12 flex-col items-center justify-center rounded-xl border text-sm transition-all",
                        isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground",
                        isInRange && "border-primary/40 bg-primary/10",
                        isStart && "border-primary bg-primary text-primary-foreground",
                        isEnd && "border-primary bg-primary text-primary-foreground",
                        "hover:border-primary hover:shadow-sm"
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                        {date.toLocaleDateString("es-MX", { month: "short" })}
                      </span>
                      <span className="font-semibold">{date.getDate()}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Reloj de selección</p>
                    <p className="text-xs text-muted-foreground">Ajusta hora y minuto para cada extremo del rango.</p>
                  </div>

                  <div className="inline-flex rounded-xl border bg-muted/40 p-1">
                    <Button
                      type="button"
                      variant={timeFormat === "12h" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setTimeFormat("12h")}
                    >
                      12h
                    </Button>
                    <Button
                      type="button"
                      variant={timeFormat === "24h" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setTimeFormat("24h")}
                    >
                      24h
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <TimeCard
                    label="Desde"
                    value={draftFrom}
                    use24h={timeFormat === "24h"}
                    onChange={setDraftFrom}
                  />
                  <TimeCard
                    label="Hasta"
                    value={draftTo}
                    use24h={timeFormat === "24h"}
                    onChange={setDraftTo}
                  />
                </div>
              </div>

              <div className="rounded-2xl border bg-gradient-to-b from-muted/30 to-background p-4 shadow-sm">
                <p className="mb-2 text-sm font-semibold text-foreground">Vista rápida</p>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      Inicio seleccionado
                    </span>
                    <span className="font-medium text-foreground">{formatDateTime(draftFrom)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Fin seleccionado
                    </span>
                    <span className="font-medium text-foreground">{formatDateTime(draftTo)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="border-t bg-muted/20 px-6 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("today")} disabled={isSubmitting}>
                  Hoy
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("24h")} disabled={isSubmitting}>
                  Últimas 24 horas
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("7d")} disabled={isSubmitting}>
                  Últimos 7 días
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => void handleClear()} disabled={isSubmitting}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
              </div>

              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                {localError && <p className="text-sm text-destructive">{localError}</p>}
                <div className="flex gap-2 lg:justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={() => void handleApply()} disabled={isSubmitting}>
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
