import { useMemo } from "react";
import { useQueryState } from "nuqs";
import { offersModeParser } from "@/pages/influencers-offers-page/model/influencers-offers.query-parsers.ts";
import type {
  IGetInfluencersOffersMatrixParams, IInfluencersOffersMatrix,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";
import {
  offersSocialMediaSearchParamParser,
  type TOfferSocialMedia,
} from "@/features/influencers-offers/offers-filter-by-platform";
import {
  offersGenresSearchParamParser,
  type TOfferMusicGenre,
} from "@/features/influencers-offers/offers-filter-by-genres";

export const EMPTY_INFLUENCERS_OFFERS_MATRIX: IInfluencersOffersMatrix = {
  offerHeaders: [],
  accountRows: [],
  links: [],
  accountsNextCursor: null,
  offersNextCursor: null,
};

export const useInfluencersOffersPageState = () => {
  const [platform, setPlatformQuery] = useQueryState(
    "platform",
    offersSocialMediaSearchParamParser,
  );

  const [genre, setGenreQuery] = useQueryState(
    "genre",
    offersGenresSearchParamParser,
  );

  const [mode, setModeQuery] = useQueryState(
    "mode",
    offersModeParser,
  );

  const handlePlatformChange = (nextPlatform: TOfferSocialMedia | null) => {
    void setPlatformQuery(nextPlatform, { history: "replace" });
  };

  const handleGenreChange = (nextGenre: TOfferMusicGenre | null) => {
    void setGenreQuery(nextGenre, { history: "replace" });
  };

  const handleModeChange = () => {
    const nextMode = mode === "offers" ? "live" : "offers";

    void setModeQuery(nextMode, { history: "replace" });
  };

  const queryParams: Omit<
    IGetInfluencersOffersMatrixParams,
    "offersCursor" | "accountsCursor"
  > = useMemo(
    () => ({
      socialMedia: platform,
      genre,
      offersTake: 10,
      accountsTake: 10,
    }),
    [platform, genre],
  );

  return {
    platform,
    genre,
    mode,
    queryParams,

    handlePlatformChange,
    handleGenreChange,
    handleModeChange,
  };
};
