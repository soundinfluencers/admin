import {
  OFFER_SOCIAL_MEDIA,
  type TOfferSocialMedia,
} from "./enums.ts";

export const OFFER_SOCIAL_MEDIA_LABELS = {
  [OFFER_SOCIAL_MEDIA.INSTAGRAM]: "Instagram",
  [OFFER_SOCIAL_MEDIA.TIKTOK_CREATORS]: "TikTok Creators",
  [OFFER_SOCIAL_MEDIA.TIKTOK_COMMUNITIES]: "TikTok Communities",
  [OFFER_SOCIAL_MEDIA.SPOTIFY]: "Spotify",
  [OFFER_SOCIAL_MEDIA.FACEBOOK]: "Facebook",
  [OFFER_SOCIAL_MEDIA.SOUNDCLOUD]: "SoundCloud",
  [OFFER_SOCIAL_MEDIA.YOUTUBE]: "YouTube",
  [OFFER_SOCIAL_MEDIA.PRESS]: "Press",
} satisfies Record<TOfferSocialMedia, string>;
