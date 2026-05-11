import { parseAsStringLiteral } from "nuqs";
import {
  PLATFORMS_OPTIONS,
  type TPlatform,
} from "@/features/influencers-offers/filter-offers-by-platforms/model/platform.config.ts";
import {
  GENRES_OPTIONS,
  type TGenres,
} from "@/features/influencers-offers/filter-offers-by-genres/model/genres.config.ts";


export const platformsValue: TPlatform[] =
  PLATFORMS_OPTIONS.map((platform) => platform.value);

export const offersPlatformParser =
  parseAsStringLiteral(platformsValue);

export const genresValue: TGenres[] = GENRES_OPTIONS.map((genre) => genre.value);

export const genresParser =
  parseAsStringLiteral(genresValue);
