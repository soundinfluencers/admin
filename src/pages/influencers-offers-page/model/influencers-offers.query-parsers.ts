import { parseAsStringLiteral } from "nuqs";

export type TOffersMode = 'offers' | 'live';

const offersMode: TOffersMode[] = ['offers', 'live'];

export const offersModeParser = parseAsStringLiteral(offersMode).withDefault("offers");
