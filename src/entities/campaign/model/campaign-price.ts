export const MIN_CAMPAIGN_PRICE = 1;
export const MAX_CAMPAIGN_PRICE = 10_000_000;

export const isValidCampaignPrice = (price: number) =>
  Number.isSafeInteger(price) &&
  price >= MIN_CAMPAIGN_PRICE &&
  price <= MAX_CAMPAIGN_PRICE;
