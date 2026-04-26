import Store from "electron-store";

export interface CashClosureReminderConfig {
  reminderTime: string;
  closureTime: string;
}

const DEFAULT_CONFIG: CashClosureReminderConfig = {
  reminderTime: "23:45",
  closureTime: "23:59",
};

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const store = new Store<{ cashClosureReminder: CashClosureReminderConfig }>({
  name: "pos-settings",
  defaults: {
    cashClosureReminder: DEFAULT_CONFIG,
  },
});

function normalizeTime(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed || !TIME_REGEX.test(trimmed)) return fallback;
  return trimmed;
}

export function getCashClosureReminderConfig(): CashClosureReminderConfig {
  const saved = store.get("cashClosureReminder");
  return {
    reminderTime: normalizeTime(saved?.reminderTime, DEFAULT_CONFIG.reminderTime),
    closureTime: normalizeTime(saved?.closureTime, DEFAULT_CONFIG.closureTime),
  };
}

export function saveCashClosureReminderConfig(
  input: CashClosureReminderConfig,
): CashClosureReminderConfig {
  const normalized = {
    reminderTime: normalizeTime(input.reminderTime, DEFAULT_CONFIG.reminderTime),
    closureTime: normalizeTime(input.closureTime, DEFAULT_CONFIG.closureTime),
  };

  store.set("cashClosureReminder", normalized);
  return normalized;
}
