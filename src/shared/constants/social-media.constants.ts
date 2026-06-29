import type { FC, SVGProps } from "react";
import type { TPlatform } from "@/shared/types/types.ts";

import Instagram from '@/assets/icons/influencers/account-details/instagram.svg?react';
import TikTok from '@/assets/icons/influencers/account-details/tiktok.svg?react';
import YouTube from '@/assets/icons/influencers/account-details/youtube.svg?react';
import Facebook from '@/assets/icons/influencers/account-details/facebook.svg?react';
import Spotify from '@/assets/icons/influencers/account-details/spotify.svg?react';
import SoundCloud from '@/assets/icons/influencers/account-details/soundcloud.svg?react';
import Press from '@/assets/icons/influencers/account-details/press.svg?react';

export const SOCIAL_MEDIA_LABEL_MAP = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  press: 'Press',
} as const satisfies Record<TPlatform, string>;

export const SOCIAL_MEDIA_VALUES = Object.keys(
  SOCIAL_MEDIA_LABEL_MAP,
) as TPlatform[];

export const SOCIAL_MEDIA_ICONS = {
  instagram: Instagram,
  tiktok: TikTok,
  youtube: YouTube,
  facebook: Facebook,
  spotify: Spotify,
  soundcloud: SoundCloud,
  press: Press,
} as const satisfies Record<TPlatform, FC<SVGProps<SVGSVGElement>>>;
