import { useEffect, useState } from "react"
import { CalendarDays } from "lucide-react"
import { Button } from "@interface/components/ui/button"
import { Badge } from "@interface/components/ui/badge"
import { cn } from "@interface/lib/utils"
import type { SaleHistoryFilters } from "@interface/store/salesStore"
import { QuickRanges } from "./QuickRanges"
import { CustomRangePicker } from "./CustomRangePicker"
import {
  parseISODate,
  startOfDay,
  endOfDay,
  startOfMonth,
  formatDateTime,
  formatDateShort,
  toDateTimeISO,
} from "./dateTimeUtils"

type ActiveTab = "quick" | "custom"

interface SalesDateTimeRangePickerProps {
  value: SaleHistoryFilters
  onApply: (filters: SaleHistoryFilters) => Promise<void> | void
  onClear: () => Promise<void> | void
  disabled?: boolean
}

export function SalesDateTimeRangePicker({
  value,
  onApply,
  onClear,
  disabled,
}: SalesDateTimeRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>("quick")
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>()
  const [draftFrom, setDraftFrom] = useState<Date>(() => parseISODate(value.fromISO) ?? startOfDay(new Date()))
  const [draftTo, setDraftTo] = useState<Date>(() => parseISODate(value.toISO) ?? endOfDay(new Date()))
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasAppliedFilters = Boolean(value.fromISO || value.toISO)

  const triggerLabel = hasAppliedFilters
    ? `${formatDateShort(parseISODate(value.fromISO)!)} – ${formatDateShort(parseISODate(value.toISO)!)}`
    : "Todos los períodos"

  useEffect(() => {
    if (!open) return
    setDraftFrom(parseISODate(value.fromISO) ?? startOfDay(new Date()))
    setDraftTo(parseISODate(value.toISO) ?? endOfDay(new Date()))
    setLocalError(null)
  }, [open, value.fromISO, value.toISO])

  const handleApply = async () => {
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
      setSelectedPresetId(undefined)
      await Promise.resolve(onClear())
      setOpen(false)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "No fue posible limpiar el filtro")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickSelect = (from: Date, to: Date, presetId: string) => {
    setDraftFrom(from)
    setDraftTo(to)
    setSelectedPresetId(presetId)
  }

  return (
    <div className="relative">
      {/* Barra principal */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors",
            "hover:border-primary/50 hover:bg-muted/30",
            open && "border-primary bg-primary/5",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rango</span>
          <span className="font-medium text-foreground">{triggerLabel}</span>
          <span className="text-muted-foreground">▾</span>
        </button>

        {hasAppliedFilters && (
          <>
            <Badge variant="default" className="gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Filtro activo
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void handleClear()}
              disabled={isSubmitting}
            >
              × Limpiar
            </Button>
          </>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[560px] rounded-xl border bg-card shadow-lg">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b px-4 pt-3">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("quick")}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors",
                  activeTab === "quick"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Rangos rápidos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("custom")}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors",
                  activeTab === "custom"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Personalizado
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="pb-3 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Contenido del tab */}
          <div className="p-4">
            {activeTab === "quick" ? (
              <QuickRanges
                selectedId={selectedPresetId}
                onSelect={handleQuickSelect}
                onOpenCustom={() => setActiveTab("custom")}
              />
            ) : (
              <CustomRangePicker
                draftFrom={draftFrom}
                draftTo={draftTo}
                currentMonth={currentMonth}
                onDraftFromChange={setDraftFrom}
                onDraftToChange={setDraftTo}
                onMonthChange={setCurrentMonth}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {draftFrom && draftTo && (
                  <>
                    <span className="font-medium text-foreground">{formatDateTime(draftFrom)}</span>
                    {" → "}
                    <span className="font-medium text-foreground">{formatDateTime(draftTo)}</span>
                  </>
                )}
              </span>
              <div className="flex gap-2">
                {localError && (
                  <span className="text-sm text-destructive">{localError}</span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleApply()}
                  disabled={isSubmitting}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}