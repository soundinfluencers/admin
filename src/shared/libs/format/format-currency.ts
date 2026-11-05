import type { TCurrency } from "@/shared/types/types.ts";

export const CURRENCY_SYMBOL: Record<TCurrency, string> = {
  EUR: "\u20AC",
  USD: "\u0024",
  GBP: "\u00A3",
};

export const formatCurrency = (
  value: number | string,
  currency: TCurrency,
): string => {
  const amount = Number(value);

  if (Number.isNaN(amount)) return "—";

  return `${amount}${CURRENCY_SYMBOL[currency]}`;
};
