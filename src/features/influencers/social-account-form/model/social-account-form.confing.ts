import type { TPlatform } from "@/shared/types/types";
import type { TSocialAccountFormValues } from "./social-account-form.schema.ts";
import type { ISocialMediaFormConfig } from "./social-account-form.types.ts";

export const ERROR_ANCHOR_MAP: Partial<Record<keyof TSocialAccountFormValues, string>> = {
  communityMusicGenres: "communityMusicGenres",
  creatorMusicGenres: "creatorMusicGenres",
  creatorContentFocus: "creatorContentFocus",
  countries: "countries",
};

export const PLATFORM_FORM_CONFIG: Record<TPlatform, ISocialMediaFormConfig> = {
  instagram: {
    hasSwitcher: true,
    hasMusicGenresCommunity: true,
    hasThemeTopics: true,
    hasMusicGenresCreators: true,
    hasContentFocus: true,
    hasAudienceInsights: true,
    inputs: [
      {
        type: "text",
        label: "Instagram account name",
        name: "username",
        placeholder: "Enter instagram account name",
      },
      {
        type: "text",
        label: "Instagram link",
        name: "profileLink",
        placeholder: "Enter instagram link",
      },
      {
        type: "number",
        label: "Followers number",
        name: "followers",
        placeholder: "Enter followers number",
      },
      {
        type: "file",
        label: "Logo",
        name: "logoUrl",
        placeholder: "Attach the logo for your brand here",
      },
    ],
  },

  tiktok: {
    hasSwitcher: true,
    hasMusicGenresCommunity: true,
    hasThemeTopics: false,
    hasMusicGenresCreators: true,
    hasContentFocus: true,
    hasAudienceInsights: true,
    inputs: [
      {
        type: "text",
        label: "TikTok account name",
        name: "username",
        placeholder: "Enter TikTok account name",
      },
      {
        type: "text",
        label: "TikTok link",
        name: "profileLink",
        placeholder: "Enter tiktok link",
      },
      {
        type: "number",
        label: "Followers number",
        name: "followers",
        placeholder: "Enter followers number",
      },
      {
        type: "file",
        label: "Logo",
        name: "logoUrl",
        placeholder: "Attach the logo for your brand here",
      },
    ],
  },

  spotify: {
    hasSwitcher: false,
    hasMusicGenresCommunity: true,
    hasThemeTopics: false,
    hasMusicGenresCreators: false,
    hasContentFocus: false,
    hasAudienceInsights: false,
    inputs: [
      {
        type: "text",
        label: "Spotify account name",
        name: "username",
        placeholder: "Enter spotify account name",
      },
      {
        type: "text",
        label: "Spotify link",
        name: "profileLink",
        placeholder: "Enter spotify link",
      },
      {
        type: "number",
        label: "Followers number",
        name: "followers",
        placeholder: "Enter followers number",
      },
      {
        type: "file",
        label: "Logo",
        name: "logoUrl",
        placeholder: "Attach the logo for your brand here",
      },
    ],
  },

  soundcloud: {
    hasSwitcher: false,
    hasMusicGenresCommunity: true,
    hasThemeTopics: false,
    hasMusicGenresCreators: false,
    hasContentFocus: false,
    hasAudienceInsights: false,
    inputs: [
      {
        type: "text",
        label: "SoundCloud account name",
        name: "username",
        placeholder: "Enter soundcloud account name",
      },
      {
        type: "text",
        label: "SoundCloud link",
        name: "profileLink",
        placeholder: "Enter soundcloud link",
      },
      {
        type: "number",
        label: "Followers number",
        name: "followers",
        placeholder: "Enter followers number",
      },
      {
        type: "file",
        label: "Logo",
        name: "logoUrl",
        placeholder: "Attach the logo for your brand here",
      },
    ],
  },

  youtube: {
    hasSwitcher: true,
    hasMusicGenresCommunity: true,
    hasThemeTopics: false,
    hasMusicGenresCreators: true,
    hasContentFocus: true,
    hasAudienceInsights: true,
    inputs: [
      {
        type: "text",
        label: "YouTube account name",
        name: "username",
        placeholder: "Enter youtube account name",
      },
      {
        type: "text",
        label: "YouTube link",
        name: "profileLink",
        placeholder: "Enter youtube link",
      },
      {
        type: "number",
        label: "Followers number",
        name: "followers",
        placeholder: "Enter followers number",
      },
      {
        type: "file",
        label: "Logo",
        name: "logoUrl",
        placeholder: "Attach the logo for your brand here",
      },
    ],
  },

  facebook: {
    hasSwitcher: false,
    hasMusicGenresCommunity: true,
    hasThemeTopics: true,
    hasMusicGenresCreators: false,
    hasContentFocus: false,
    hasAudienceInsights: true,
    inputs: [
      {
        type: "text",
        label: "Facebook account name",
        name: "username",
        placeholder: "Enter facebook account name",
      },
      {
        type: "text",
        label: "Facebook link",
        name: "profileLink",
        placeholder: "Enter facebook link",
      },
      {
        type: "number",
        label: "Followers number",
        name: "followers",
        placeholder: "Enter followers number",
      },
      {
        type: "file",
        label: "Logo",
        name: "logoUrl",
        placeholder: "Attach the logo for your brand here",
      },
    ],
  },

  press: {
    hasSwitcher: false,
    hasMusicGenresCommunity: true,
    hasThemeTopics: false,
    hasMusicGenresCreators: false,
    hasContentFocus: false,
    hasAudienceInsights: true,
    inputs: [
      {
        type: "text",
        label: "Press account name",
        name: "username",
        placeholder: "Enter press account name",
      },
      {
        type: "text",
        label: "Press link",
        name: "profileLink",
        placeholder: "Enter press link",
      },
      {
        type: "file",
        label: "Logo",
        name: "logoUrl",
        placeholder: "Attach the logo for your brand here",
      },
    ],
  },
};
