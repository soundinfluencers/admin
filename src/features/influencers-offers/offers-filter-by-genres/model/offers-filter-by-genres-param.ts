import { parseAsStringLiteral } from "nuqs";
import { OFFER_MUSIC_GENRES } from "../constants/enums";

export const offersGenresSearchParamParser =
  parseAsStringLiteral(Object.values(OFFER_MUSIC_GENRES)).withDefault(OFFER_MUSIC_GENRES.TECHNO_MELODIC_MINIMAL);
