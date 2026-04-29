import type { IPaymentHistoryCell } from "@/entities/payment-history/model/payment-history.types.ts";

export function mergeById<T, K extends keyof T>(
  prev: T[],
  next: T[],
  key: K,
) {
  const map = new Map<T[K], T>();

  for (const item of prev) {
    map.set(item[key], item);
  }

  for (const item of next) {
    map.set(item[key], item);
  }

  return Array.from(map.values());
}

export function mergeCells(
  prev: IPaymentHistoryCell[],
  next: IPaymentHistoryCell[],
) {
  const map = new Map<string, IPaymentHistoryCell>();

  for (const cell of prev) {
    map.set(`${cell.campaignId}:${cell.accountId}`, cell);
  }

  for (const cell of next) {
    map.set(`${cell.campaignId}:${cell.accountId}`, cell);
  }

  return Array.from(map.values());
}
