import React from "react"
import { cn } from "@interface/lib/utils"
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  addDays,
  formatDateShort,
} from "./dateTimeUtils"

interface Preset {
  id: string
  label: string
  description: string
  getRange: () => { from: Date; to: Date }
}

function buildPresets(): Preset[] {
  const now = new Date()
  return [
    {
      id: "today",
      label: "Hoy",
      description: "Desde 00:00 hoy",
      getRange: () => ({ from: startOfDay(now), to: endOfDay(now) }),
    },
    {
      id: "24h",
      label: "Últimas 24 horas",
      description: "Hace 24 h exactas",
      getRange: () => ({ from: addDays(now, -1), to: now }),
    },
    {
      id: "7d",
      label: "Últimos 7 días",
      description: `${formatDateShort(addDays(now, -7))} – ${formatDateShort(now)}`,
      getRange: () => ({ from: addDays(startOfDay(now), -7), to: endOfDay(now) }),
    },
    {
      id: "30d",
      label: "Últimos 30 días",
      description: `${formatDateShort(addDays(now, -30))} – ${formatDateShort(now)}`,
      getRange: () => ({ from: addDays(startOfDay(now), -30), to: endOfDay(now) }),
    },
    {
      id: "month",
      label: "Este mes",
      description: `1 – ${formatDateShort(now)}`,
      getRange: () => ({ from: startOfMonth(now), to: endOfDay(now) }),
    },
    {
      id: "lastMonth",
      label: "Mes pasado",
      description: (() => {
        const last = new Date(now.getFullYear(), now.getMonth(), 0)
        return `1 – ${formatDateShort(last)}`
      })(),
      getRange: () => {
        const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const last = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 0)
        return { from: first, to: last }
      },
    },
  ]
}

interface QuickRangesProps {
  selectedId?: string
  onSelect: (from: Date, to: Date, presetId: string) => void
  onOpenCustom: () => void
}

export const QuickRanges: React.FC<QuickRangesProps> = ({
  selectedId,
  onSelect,
  onOpenCustom,
}) => {
  const presets = buildPresets()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              const { from, to } = preset.getRange()
              onSelect(from, to, preset.id)
            }}
            className={cn(
              "flex flex-col items-start rounded-lg border p-3 text-left transition-colors hover:border-primary/50",
              selectedId === preset.id
                ? "border-primary bg-primary/10"
                : "border-border bg-background"
            )}
          >
            <span className="text-sm font-medium">{preset.label}</span>
            <span className="text-xs text-muted-foreground">{preset.description}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenCustom}
        className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm transition-colors hover:border-primary/50"
      >
        <span className="text-muted-foreground">¿Necesitas fechas u horas específicas?</span>
        <span className="font-medium text-primary">Abrir personalizado →</span>
      </button>
    </div>
  )
}