import type { TInfluencerAccount } from "@/entities/requests/model/requests.types.ts";

/**
 * Flattens musicGenres nested structure to a flat array of display strings.
 * Genre is always added as its own chip, followed by each subGenre as a separate chip.
 */
export const parseMusicGenres = (
  musicGenres: TInfluencerAccount["musicGenres"],
): string[] => {
  return musicGenres.flatMap((item) => [item.genre, ...item.subGenres]);
};

export type TParsedCountry = {
  ordinal: string;
  label: string;
};

/**
 * Formats countries array into structured items with a separate ordinal and label.
 * e.g. { country: "UK", percentage: 24 } → { ordinal: "#1", label: "24% - UK" }
 */
export const parseCountries = (
  countries: TInfluencerAccount["countries"],
): TParsedCountry[] => {
  return countries
    .filter((item) => item.country)
    .map((item, index) => ({
      ordinal: `#${index + 1}`,
      label: `${item.percentage}% - ${item.country}`,
    }));
};

