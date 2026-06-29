import type { FC, SVGProps } from "react";
import type { TPlatform } from "@/shared/types/types.ts";

import Instagram from '@/assets/icons/influencers/account-details/instagram.svg?react';
import TikTok from '@/assets/icons/influencers/account-details/tiktok.svg?react';
import YouTube from '@/assets/icons/influencers/account-details/youtube.svg?react';
import Facebook from '@/assets/icons/influencers/account-details/facebook.svg?react';
import Spotify from '@/assets/icons/influencers/account-details/spotify.svg?react';
import SoundCloud from '@/assets/icons/influencers/account-details/soundcloud.svg?react';
import Press from '@/assets/icons/influencers/account-details/press.svg?react';

type TSocialAccountConfig = {
  value: TPlatform;
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
};

export const SOCIAL_ACCOUNTS_PLATFORM_CONFIG = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "tiktok", label: "TikTok", icon: TikTok },
  { value: "spotify", label: "Spotify", icon: Spotify },
  { value: "youtube", label: "YouTube", icon: YouTube },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "soundcloud", label: "SoundCloud", icon: SoundCloud },
  { value: "press", label: "Press", icon: Press },
] as const satisfies readonly TSocialAccountConfig[];
