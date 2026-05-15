import type { IOfferAccountRow, IOfferLink } from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export function mergeByKey<T>(
  prev: T[],
  next: T[],
  getKey: (item: T) => string,
): T[] {
  const map = new Map<string, T>();

  for (const item of prev) {
    map.set(getKey(item), item);
  }

  for (const item of next) {
    map.set(getKey(item), item);
  }

  return Array.from(map.values());
}

export function getOfferAccountRowKey(row: Pick<
  IOfferAccountRow,
  "influencerId" | "accountId"
>): string {
  return `${row.influencerId}:${row.accountId}`;
}

export function getOfferAccountLinkKey(link: Pick<
  IOfferLink,
  "offerId" | "influencerId" | "accountId"
>): string {
  return `${link.offerId}:${link.influencerId}:${link.accountId}`;
}

export function mergeOfferAccountRows(
  prev: IOfferAccountRow[],
  next: IOfferAccountRow[],
): IOfferAccountRow[] {
  return mergeByKey(prev, next, getOfferAccountRowKey);
}

export function mergeOfferAccountLinks(
  prev: IOfferLink[],
  next: IOfferLink[],
): IOfferLink[] {
  return mergeByKey(prev, next, getOfferAccountLinkKey);
}
