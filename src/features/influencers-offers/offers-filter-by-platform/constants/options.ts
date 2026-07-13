import { OFFER_SOCIAL_MEDIA } from "./enums.ts";
import { OFFER_SOCIAL_MEDIA_LABELS } from "./labels.ts";

import type { TOfferSocialMediaOption } from "./types.ts";

import Instagram from '@/assets/icons/influencers/social-media/instagram.svg?react';
import TikTok from '@/assets/icons/influencers/social-media/tiktok.svg?react';
import Spotify from '@/assets/icons/influencers/social-media/spotify.svg?react';
import Facebook from '@/assets/icons/influencers/social-media/facebook.svg?react';
import SoundCloud from '@/assets/icons/influencers/social-media/soundcloud.svg?react';
import YouTube from '@/assets/icons/influencers/social-media/youtube.svg?react';
import Press from '@/assets/icons/influencers/social-media/press.svg?react';

export const OFFER_SOCIAL_MEDIA_OPTIONS = [
  {
    value: OFFER_SOCIAL_MEDIA.INSTAGRAM,
    label: OFFER_SOCIAL_MEDIA_LABELS[OFFER_SOCIAL_MEDIA.INSTAGRAM],
    icon: Instagram,
  },
  {
    value: OFFER_SOCIAL_MEDIA.TIKTOK_CREATORS,
    label: OFFER_SOCIAL_MEDIA_LABELS[OFFER_SOCIAL_MEDIA.TIKTOK_CREATORS],
    icon: TikTok,
  },
  {
    value: OFFER_SOCIAL_MEDIA.TIKTOK_COMMUNITIES,
    label: OFFER_SOCIAL_MEDIA_LABELS[OFFER_SOCIAL_MEDIA.TIKTOK_COMMUNITIES],
    icon: TikTok,
  },
  {
    value: OFFER_SOCIAL_MEDIA.SPOTIFY,
    label: OFFER_SOCIAL_MEDIA_LABELS[OFFER_SOCIAL_MEDIA.SPOTIFY],
    icon: Spotify,
  },
  {
    value: OFFER_SOCIAL_MEDIA.FACEBOOK,
    label: OFFER_SOCIAL_MEDIA_LABELS[OFFER_SOCIAL_MEDIA.FACEBOOK],
    icon: Facebook,
  },
  {
    value: OFFER_SOCIAL_MEDIA.SOUNDCLOUD,
    label: OFFER_SOCIAL_MEDIA_LABELS[OFFER_SOCIAL_MEDIA.SOUNDCLOUD],
    icon: SoundCloud,
  },
  {
    value: OFFER_SOCIAL_MEDIA.YOUTUBE,
    label: OFFER_SOCIAL_MEDIA_LABELS[OFFER_SOCIAL_MEDIA.YOUTUBE],
    icon: YouTube,
  },
  {
    value: OFFER_SOCIAL_MEDIA.PRESS,
    label: OFFER_SOCIAL_MEDIA_LABELS[OFFER_SOCIAL_MEDIA.PRESS],
    icon: Press,
  },
] satisfies TOfferSocialMediaOption[];
