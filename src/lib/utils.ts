import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Title-case utility for display labels (handles space, hyphen, slash)
export function toTitleCase(input?: string | null): string {
  if (!input) return "";
  return input
    .split(/([\s\-/]+)/) // keep delimiters
    .map((chunk) => {
      if (/^[\s\-/]+$/.test(chunk)) return chunk; // delimiter
      return chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase();
    })
    .join("");
}

export function formatCurrency(amount: number, currency: string = "EUR") {
  const symbol = currency && currency.toUpperCase() === "EUR" ? "€" : currency?.toUpperCase() || "€";
  return `${symbol} ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
