import { clsx, type ClassValue } from "clsx";

/**
 * Joins conditional class names. Thin wrapper over `clsx` so components import
 * one helper; conflicting Tailwind classes are avoided by component design
 * rather than merged at runtime.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
