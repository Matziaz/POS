import { ValidationError } from "../../core/errors";

export function requireNonEmpty(value: string, field: string) {
  if (!value?.trim()) throw new ValidationError(`${field} is required`);
}

export function requirePositiveNumber(value: number, field: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new ValidationError(`${field} must be a positive number`);
  }
}

export function requireNonNegativeInt(value: number, field: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationError(`${field} must be a non-negative integer`);
  }
}

export function requirePositiveInt(value: number, field: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${field} must be a positive integer`);
  }
}