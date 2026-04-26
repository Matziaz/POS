import React, { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@interface/components/ui/button"
import { cn } from "@interface/lib/utils"
import {
  startOfDay,
  startOfMonth,
  addDays,
  addMonths,
  isSameDay,
  isBeforeDay,
  setTimeOnDate,
  WEEKDAY_LABELS,
} from "./dateTimeUtils"

interface CustomRangePickerProps {
  draftFrom: Date
  draftTo: Date
  currentMonth: Date
  onDraftFromChange: (date: Date) => void
  onDraftToChange: (date: Date) => void
  onMonthChange: (date: Date) => void
}

export const CustomRangePicker: React.FC<CustomRangePickerProps> = ({
  draftFrom,
  draftTo,
  currentMonth,
  onDraftFromChange,
  onDraftToChange,
  onMonthChange,
}) => {
  const [selectionStep, setSelectionStep] = React.useState<"from" | "to">("from")

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const gridStart = addDays(monthStart, -monthStart.getDay())
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  }, [currentMonth])

  const fromDay = startOfDay(draftFrom)
  const toDay = startOfDay(draftTo)

  const handleDayClick = (date: Date) => {
    const clicked = startOfDay(date)

    if (selectionStep === "from") {
      onDraftFromChange(setTimeOnDate(clicked, 0, 0))
      onDraftToChange(setTimeOnDate(clicked, 23, 59))
      setSelectionStep("to")
      onMonthChange(startOfMonth(clicked))
      return
    }

    if (isBeforeDay(clicked, fromDay)) {
      onDraftToChange(setTimeOnDate(fromDay, 23, 59))
      onDraftFromChange(setTimeOnDate(clicked, 0, 0))
    } else {
      onDraftToChange(setTimeOnDate(clicked, 23, 59))
    }

    setSelectionStep("from")
    onMonthChange(startOfMonth(clicked))
  }

  const handleFromTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number)
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      onDraftFromChange(setTimeOnDate(draftFrom, h, m))
    }
  }

  const handleToTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number)
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      onDraftToChange(setTimeOnDate(draftTo, h, m))
    }
  }

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = new Date(e.target.value)
    if (!Number.isNaN(parsed.getTime())) {
      onDraftFromChange(setTimeOnDate(parsed, draftFrom.getHours(), draftFrom.getMinutes()))
      onMonthChange(startOfMonth(parsed))
    }
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = new Date(e.target.value)
    if (!Number.isNaN(parsed.getTime())) {
      onDraftToChange(setTimeOnDate(parsed, draftTo.getHours(), draftTo.getMinutes()))
    }
  }

  const toInputDate = (date: Date) => date.toISOString().slice(0, 10)
  const toInputTime = (date: Date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`

  const monthLabel = currentMonth.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
      {/* Calendario */}
      <div className="rounded-lg border bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold capitalize">{monthLabel}</span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onMonthChange(addMonths(currentMonth, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAY_LABELS.map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
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
                  "flex h-9 w-full items-center justify-center rounded-md text-sm transition-colors",
                  !isCurrentMonth && "text-muted-foreground opacity-40",
                  isInRange && !isStart && !isEnd && "bg-primary/10",
                  (isStart || isEnd) && "bg-primary text-primary-foreground",
                  !isStart && !isEnd && "hover:bg-muted"
                )}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Inputs de fecha y hora */}
      <div className="flex flex-col gap-4 min-w-[220px]">
        <div className="rounded-lg border bg-background p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Desde
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={toInputDate(draftFrom)}
              onChange={handleFromDateChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={toInputTime(draftFrom)}
              onChange={handleFromTimeChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Hasta
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={toInputDate(draftTo)}
              onChange={handleToDateChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={toInputTime(draftTo)}
              onChange={handleToTimeChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}