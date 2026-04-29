import type { IPaymentHistoryCell } from "@/entities/payment-history/model/payment-history.types.ts";

export const getPaymentHistoryCellKey = (
  campaignId: string,
  accountId: string,
) => `${campaignId}:${accountId}`;

export const createPaymentHistoryCellMap = (
  cells: IPaymentHistoryCell[],
) => {
  const map = new Map<string, IPaymentHistoryCell>();

  cells.forEach((cell) => {
    map.set(getPaymentHistoryCellKey(cell.campaignId, cell.accountId), cell);
  });

  return map;
};
