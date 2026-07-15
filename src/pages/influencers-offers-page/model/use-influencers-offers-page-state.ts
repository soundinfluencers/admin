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
  type TOfferGenre,
} from "@/features/influencers-offers/offers-filter-by-genres";
import {
  isOfferCreatorMusicGenre, isOfferMusicGenre,
} from "@/features/influencers-offers/offers-filter-by-genres/model/offers-filter-by-genres.guards.ts";
import {
  OFFER_CREATOR_MUSIC_GENRES_CONFIG, OFFER_MUSIC_GENRES_CONFIG,
} from "@/features/influencers-offers/offers-filter-by-genres/constants/config.ts";

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

  const [genreQuery, setGenreQuery] = useQueryState(
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

  const handleGenreChange = (nextGenre: TOfferGenre | null) => {
    void setGenreQuery(nextGenre, { history: "replace" });
  };

  const handleModeChange = () => {
    const nextMode = mode === "offers" ? "live" : "offers";

    void setModeQuery(nextMode, { history: "replace" });
  };

  const isCreatorPlatform =
    platform === "tiktok_creators";

  const genre = isCreatorPlatform
    ? genreQuery &&
    isOfferCreatorMusicGenre(genreQuery)
      ? genreQuery
      : OFFER_CREATOR_MUSIC_GENRES_CONFIG.defaultValue
    : genreQuery &&
    isOfferMusicGenre(genreQuery)
      ? genreQuery
      : OFFER_MUSIC_GENRES_CONFIG.defaultValue;

  const genreOptions = isCreatorPlatform
    ? OFFER_CREATOR_MUSIC_GENRES_CONFIG.options
    : OFFER_MUSIC_GENRES_CONFIG.options;

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
    genreOptions,
    mode,
    queryParams,

    handlePlatformChange,
    handleGenreChange,
    handleModeChange,
  };
};
