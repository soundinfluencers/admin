import { useMemo } from "react";
import {
  useQueryState,
} from "nuqs";
import {
  genresParser, offersModeParser,
  offersPlatformParser,
} from "@/pages/influencers-offers-page/model/influencers-offers.query-parsers.ts";
import type { TGenres } from "@/features/influencers-offers/filter-offers-by-genres/model/genres.config.ts";
import type { TPlatform } from "@/features/influencers-offers/filter-offers-by-platforms/model/platform.config.ts";
import type {
  IGetInfluencersOffersMatrixParams, IInfluencersOffersMatrix,
} from "@/entities/influencers-offers/model/influencers-offers.types.ts";


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
    offersPlatformParser,
  );

  const [genre, setGenreQuery] = useQueryState(
    "genre",
    genresParser,
  );

  const [mode, setModeQuery] = useQueryState(
    "mode",
    offersModeParser,
  );

  const handlePlatformChange = (nextPlatform: TPlatform | null) => {
    void setPlatformQuery(nextPlatform, { history: "replace" });
  };

  const handleGenreChange = (nextGenre: TGenres | null) => {
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
