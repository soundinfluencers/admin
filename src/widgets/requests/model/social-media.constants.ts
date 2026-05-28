import type { TSocialMedia } from "@/shared/types/types.ts";

import instagramDark from '@/assets/icons/requests/instagram-dark.svg';
import tikTokDark from '@/assets/icons/requests/tiktok-dark.svg';
import youTubeDark from '@/assets/icons/requests/youtube-dark.svg';
import facebookDark from '@/assets/icons/requests/facebook-dark.svg';
import spotifyDark from '@/assets/icons/requests/spotify-dark.svg';
import soundCloudDark from '@/assets/icons/requests/soundcloud-dark.svg';
import pressDark from '@/assets/icons/requests/press-dark.svg';
// import multiPromo from '@/assets/icons/requests/multi-promo.svg';

export const SOCIAL_MEDIA_LABEL_MAP = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  press: 'Press',
} as const satisfies Record<Exclude<TSocialMedia, 'multipromo'>, string>;

export const SOCIAL_MEDIA_DARK_ICONS = {
  instagram: instagramDark,
  tiktok: tikTokDark,
  youtube: youTubeDark,
  facebook: facebookDark,
  spotify: spotifyDark,
  soundcloud: soundCloudDark,
  press: pressDark,
} as const satisfies Record<Exclude<TSocialMedia, 'multipromo'>, string>;
