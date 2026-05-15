import type {
  IGetInfluencersOffersMatrixParams
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";

export const influencersOffersQueryKeys = {
  all: ["influencer-offers"] as const,

  matrixRoot: () =>
    [...influencersOffersQueryKeys.all, "matrix"] as const,

  matrix: (params: IGetInfluencersOffersMatrixParams) =>
    [...influencersOffersQueryKeys.matrixRoot(), params] as const,
};
