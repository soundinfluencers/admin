import { buildTreeMetaMap, getAncestorValues } from "@/shared/ui/checkbox-tree/checkbox-tree.helpers.ts";
import {
  CONTENT_FOCUS_OPTIONS,
  MUSIC_GENRES_COMMUNITY,
  MUSIC_GENRES_CREATOR,
  THEME_TOPICS,
} from "../model/social-account-form.constants.ts";

import type { NestedOption } from "@/shared/ui/checkbox-tree/checkbox-tree.types.ts";
import type { TSocialAccountFormValues } from "../model/social-account-form.schema.ts";
import type { ISocialAccount } from "@/entities/influencers/social-account/model/social-account.types.ts";

interface MapValuesToSelectedTreeParams {
  values?: string[];
  options: NestedOption[];
}

const toFormString = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";

  return String(value);
};

const mapCountriesToForm = (
  countries: { country: string; percentage: number }[],
  size = 5,
) => {
  const mapped = countries.map((item) => ({
    country: item.country ?? "",
    percentage: toFormString(item.percentage),
  }));

  while (mapped.length < size) {
    mapped.push({
      country: "",
      percentage: "",
    });
  }

  return mapped.slice(0, size);
};

export const mapValuesToSelectedTree = ({
  values = [],
  options,
}: MapValuesToSelectedTreeParams): string[] => {
  const selectedSet = new Set<string>();
  const metaMap = buildTreeMetaMap(options);

  values.forEach((value) => {
    selectedSet.add(value);

    getAncestorValues(value, metaMap).forEach((ancestorValue) => {
      selectedSet.add(ancestorValue);
    });
  });

  return Array.from(selectedSet);
};

export const mapSocialAccountToFormMapper = (
  socialAccount?: ISocialAccount,
): TSocialAccountFormValues => {
  if (!socialAccount) {
    return {
      username: "",
      profileLink: "",
      followers: "",
      logoUrl: "",
      profileCategory: "community",

      communityMusicGenres: [],
      communityThemeTopics: [],
      creatorMusicGenres: [],
      creatorContentFocus: [],

      countries: [
        { country: "", percentage: "" },
        { country: "", percentage: "" },
        { country: "", percentage: "" },
        { country: "", percentage: "" },
        { country: "", percentage: "" },
      ],

      currency: "EUR",
      price: "",
      engagementRate: "",
      averageViews: "",
    };
  }

  return {
    username: socialAccount.username,
    profileLink: socialAccount.profileLink,
    followers: toFormString(socialAccount.followers),
    logoUrl: socialAccount.logoUrl ?? "",
    profileCategory: socialAccount.profileCategory,

    communityMusicGenres: mapValuesToSelectedTree({
      values: socialAccount.communityMusicGenres,
      options: MUSIC_GENRES_COMMUNITY,
    }),
    communityThemeTopics: mapValuesToSelectedTree({
      values: socialAccount.communityThemeTopics,
      options: THEME_TOPICS,
    }),
    creatorMusicGenres: mapValuesToSelectedTree({
      values: socialAccount.creatorMusicGenres,
      options: MUSIC_GENRES_CREATOR,
    }),
    creatorContentFocus: mapValuesToSelectedTree({
      values: socialAccount.creatorContentFocus,
      options: CONTENT_FOCUS_OPTIONS,
    }),

    countries: mapCountriesToForm(socialAccount.countries),

    currency: socialAccount.currency,
    price: toFormString(socialAccount.price),
    engagementRate: toFormString(socialAccount.engagementRate),
    averageViews: toFormString(socialAccount.averageViews),
  };
};
