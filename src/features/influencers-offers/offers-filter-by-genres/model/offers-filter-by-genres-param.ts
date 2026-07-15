import { parseAsStringLiteral } from "nuqs";
import { OFFER_MUSIC_GENRES, OFFER_CREATOR_MUSIC_GENRES } from "../constants/enums";

const OFFER_GENRES = [
  ...Object.values(OFFER_MUSIC_GENRES),
  ...Object.values(OFFER_CREATOR_MUSIC_GENRES),
] as const;

export const offersGenresSearchParamParser =
  parseAsStringLiteral(OFFER_GENRES);
