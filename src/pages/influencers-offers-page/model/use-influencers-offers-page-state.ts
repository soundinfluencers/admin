// import { useEffect, useMemo, useState } from "react";
import {
  useQueryState,
} from "nuqs";
import {
  genresParser,
  offersPlatformParser,
} from "@/pages/influencers-offers-page/model/influencers-offers.query-parsers.ts";
import type { TGenres } from "@/features/influencers-offers/filter-offers-by-genres/model/genres.config.ts";
import type { TPlatform } from "@/features/influencers-offers/filter-offers-by-platforms/model/platform.config.ts";

export const useInfluencersOffersPageState = () => {
  const [platform, setPlatformQuery] = useQueryState(
    "platform",
    offersPlatformParser.withDefault('instagram'),
  );

  const [genre, setGenreQuery] = useQueryState(
    "genre",
    genresParser.withDefault('Techno (Melodic, Minimal)'),
  );


  const handlePlatformChange = (nextPlatform: TPlatform | null) => {
    const resolvedPlatform = nextPlatform === platform ? null : nextPlatform;

    void setPlatformQuery(resolvedPlatform, { history: "replace" });
  };

  const handleGenreChange = (nextGenre: TGenres | null) => {
    const resolvedGenre = nextGenre === genre ? null : nextGenre;

    void setGenreQuery(resolvedGenre, { history: "replace" });
  };

  // const queryParams: any = useMemo(
  //   () => ({
  //     limit,
  //     page,
  //     ...(query.trim() ? { search: query.trim() } : {}),
  //     ...(platform ? { platform } : {}),
  //   }),
  //   [limit, page, query, platform],
  // );

  return {
    platform,
    genre,

    handlePlatformChange,
    handleGenreChange,
  };
};
