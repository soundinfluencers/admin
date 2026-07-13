export const OFFER_SOCIAL_MEDIA = {
  INSTAGRAM: "instagram",
  TIKTOK_CREATORS: "tiktok_creators",
  TIKTOK_COMMUNITIES: "tiktok_communities",
  FACEBOOK: "facebook",
  YOUTUBE: "youtube",
  SPOTIFY: "spotify",
  SOUNDCLOUD: "soundcloud",
  PRESS: "press",
} as const;

export type TOfferSocialMedia = (typeof OFFER_SOCIAL_MEDIA)[keyof typeof OFFER_SOCIAL_MEDIA];

