import type { TInfluencerAccount } from "@/entities/requests/model/requests.types.ts";
import type { NestedOption } from "@/shared/ui/checkbox-tree/checkbox-tree.types.ts";
import {
  CONTENT_FOCUS_OPTIONS,
  MUSIC_GENRES_COMMUNITY,
  MUSIC_GENRES_CREATOR,
  THEME_TOPICS,
} from "@/features/influencers/social-account-form";
import type { ISocialAccount } from "@/entities/influencers/social-account/model/social-account.types.ts";

/**
 * Flattens musicGenres nested structure to a flat array of display strings.
 * Genre is always added as its own chip, followed by each subGenre as a separate chip.
 */
type TOptionLabelMap = Record<string, string>;

export const createOptionLabelMap = (
  options: readonly NestedOption[],
): TOptionLabelMap => {
  const map: TOptionLabelMap = {};

  const walk = (items: readonly NestedOption[]) => {
    items.forEach((item) => {
      map[item.value] = item.label;

      if (item.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(options);

  return map;
};

export const parseOptionValues = (
  values: readonly string[] | undefined,
  labelMap: TOptionLabelMap,
): string[] => {
  if (!values?.length) return [];

  return values.map((value) => labelMap[value] ?? value);
};

const COMMUNITY_MUSIC_GENRES_LABELS = createOptionLabelMap(MUSIC_GENRES_COMMUNITY);
const THEME_TOPICS_LABELS = createOptionLabelMap(THEME_TOPICS);

const CREATOR_MUSIC_GENRES_LABELS = createOptionLabelMap(MUSIC_GENRES_CREATOR);
const CONTENT_FOCUS_LABELS = createOptionLabelMap(CONTENT_FOCUS_OPTIONS);

export const parseCommunityMusicGenres = (
  values: ISocialAccount["communityMusicGenres"],
): string[] => {
  return parseOptionValues(values, COMMUNITY_MUSIC_GENRES_LABELS);
};

export const parseThemeTopics = (
  values: ISocialAccount["communityThemeTopics"],
): string[] => {
  return parseOptionValues(values, THEME_TOPICS_LABELS);
};

export const parseCreatorMusicGenres = (
  values: ISocialAccount["creatorMusicGenres"],
): string[] => {
  return parseOptionValues(values, CREATOR_MUSIC_GENRES_LABELS);
};

export const parseCreatorContentFocus = (
  values: ISocialAccount["creatorContentFocus"],
): string[] => {
  return parseOptionValues(values, CONTENT_FOCUS_LABELS);
};

/**
 * Formats countries array into structured items with a separate ordinal and label.
 * e.g. { country: "UK", percentage: 24 } → { ordinal: "#1", label: "24% - UK" }
 */

export type TParsedCountry = {
  ordinal: string;
  label: string;
};

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

