import {
  CONTENT_FOCUS_OPTIONS,
  MUSIC_GENRES_COMMUNITY,
  MUSIC_GENRES_CREATOR,
  THEME_TOPICS,
  type TSocialAccountFormValues,
} from "@/features/influencers/social-account-form";
import type { NestedOption } from "@/shared/ui/checkbox-tree/checkbox-tree.types.ts";
import type { TSocialAccountRequest } from "@/entities/influencers/social-account";

interface MapSelectedTreeToValuesParams {
  selectedValues?: string[];
  options: NestedOption[];
}

const toNumber = (value: string | undefined | null): number => {
  const normalized = value?.replace(",", ".").trim();

  if (!normalized) return 0;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapCountriesToDto = (
  countries: TSocialAccountFormValues["countries"],
): { country: string; percentage: number }[] => {
  return countries
  .filter((item) => item.country.trim() || item.percentage.trim())
  .map((item) => ({
    country: item.country.trim(),
    percentage: toNumber(item.percentage),
  }));
};

const collectLeafValues = (options: NestedOption[]): Set<string> => {
  const leafValues = new Set<string>();

  const walk = (nodes: NestedOption[]) => {
    nodes.forEach((node) => {
      if (node.children?.length) {
        walk(node.children);
        return;
      }

      leafValues.add(node.value);
    });
  };

  walk(options);

  return leafValues;
};

export const mapSelectedTreeToValues = ({
  selectedValues = [],
  options,
}: MapSelectedTreeToValuesParams): string[] => {
  const leafValues = collectLeafValues(options);
  const selectedSet = new Set(selectedValues);

  return Array.from(selectedSet).filter((value) => leafValues.has(value));
};

export const mapSocialAccountForDto = (
  socialAccount: TSocialAccountFormValues,
): TSocialAccountRequest => {
  const communityMusicGenres = mapSelectedTreeToValues({
    selectedValues: socialAccount.communityMusicGenres,
    options: MUSIC_GENRES_COMMUNITY,
  });

  const communityThemeTopics = mapSelectedTreeToValues({
    selectedValues: socialAccount.communityThemeTopics,
    options: THEME_TOPICS,
  });

  const creatorMusicGenres = mapSelectedTreeToValues({
    selectedValues: socialAccount.creatorMusicGenres,
    options: MUSIC_GENRES_CREATOR,
  });

  const creatorContentFocus = mapSelectedTreeToValues({
    selectedValues: socialAccount.creatorContentFocus,
    options: CONTENT_FOCUS_OPTIONS,
  });

  const isCommunity = socialAccount.profileCategory === "community";
  const isCreator = socialAccount.profileCategory === "creator";

  return {
    username: socialAccount.username,
    profileLink: socialAccount.profileLink,
    followers: toNumber(socialAccount.followers),
    logoUrl: socialAccount.logoUrl,
    profileCategory: socialAccount.profileCategory,
    price: toNumber(socialAccount.price),
    currency: socialAccount.currency,

    communityMusicGenres: isCommunity ? communityMusicGenres : undefined,
    communityThemeTopics: isCommunity ? communityThemeTopics : undefined,
    creatorMusicGenres: isCreator ? creatorMusicGenres : undefined,
    creatorContentFocus: isCreator ? creatorContentFocus : undefined,

    countries: mapCountriesToDto(socialAccount.countries),

    engagementRate: toNumber(socialAccount.engagementRate),
    averageViews: toNumber(socialAccount.averageViews),
  };
};
