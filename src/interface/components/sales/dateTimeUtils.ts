export type TimeFormat = "12h" | "24h"
export type RangeEndpoint = "from" | "to"

export const WEEKDAY_LABELS = ["do.", "lu.", "ma.", "mi.", "ju.", "vi.", "sá."]

export function pad(value: number): string {
  return String(value).padStart(2, "0")
}

export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime())
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0, 0)
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function isBeforeDay(left: Date, right: Date): boolean {
  return startOfDay(left).getTime() < startOfDay(right).getTime()
}

export function parseISODate(value?: string): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return isValidDate(parsed) ? parsed : null
}

export function formatDateTime(date: Date | null): string {
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

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function setTimeOnDate(date: Date, hour: number, minute: number): Date {
  const next = new Date(date)
  next.setHours(hour, minute, 0, 0)
  return next
}

export function toDateTimeISO(date: Date): string {
  return date.toISOString()
}