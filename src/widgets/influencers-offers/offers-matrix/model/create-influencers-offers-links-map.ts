import type { IOfferLink } from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import { getOfferAccountLinkKey } from "@/pages/influencers-offers-page/model/influencers-offers-page.helpers.ts";

export const createInfluencersOffersLinksMap = (links: IOfferLink[]) => {
  const map = new Map<string, IOfferLink>();

  for (const link of links) {
    map.set(getOfferAccountLinkKey(link), link);
  }

  return map;
};
