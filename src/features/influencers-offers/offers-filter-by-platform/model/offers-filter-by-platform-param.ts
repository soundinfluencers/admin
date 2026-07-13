import { parseAsStringLiteral } from "nuqs";
import { OFFER_SOCIAL_MEDIA } from "../constants/enums";

export const offersSocialMediaSearchParamParser =
  parseAsStringLiteral(Object.values(OFFER_SOCIAL_MEDIA)).withDefault(OFFER_SOCIAL_MEDIA.INSTAGRAM);
