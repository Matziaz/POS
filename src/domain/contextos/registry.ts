import type { PosContext } from "./PosContext";
import { defaultContext } from "./defaultContext";
import { retailContext } from "./retailContext";

const contexts = new Map<string, PosContext>([
  [defaultContext.name, defaultContext],
  [retailContext.name, retailContext],
]);

export function getAvailablePosContexts(): PosContext[] {
  return Array.from(contexts.values());
}

export function resolvePosContext(name: string | null | undefined): PosContext {
  const normalized = (name ?? "").trim().toLowerCase();
  if (!normalized) return defaultContext;
  return contexts.get(normalized) ?? defaultContext;
}
