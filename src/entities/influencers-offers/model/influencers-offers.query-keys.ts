import type {
  IGetInfluencersOffersMatrixParams, IGetOffersClientsParams,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export const influencersOffersQueryKeys = {
  all: ["influencer-offers"] as const,

  matrixRoot: () =>
    [...influencersOffersQueryKeys.all, "matrix"] as const,

  matrix: (params: IGetInfluencersOffersMatrixParams) =>
    [...influencersOffersQueryKeys.matrixRoot(), params] as const,
};

export const influencerClientOffersQueryKeys = {
  all: ["influencer-clients-offers"],

  lists: () => [...influencerClientOffersQueryKeys.all, 'list'] as const,

  list: (param: IGetOffersClientsParams) =>
    [...influencerClientOffersQueryKeys.lists(), param] as const,
};
