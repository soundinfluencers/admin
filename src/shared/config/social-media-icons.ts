import type { ComponentType, SVGProps } from 'react';

import type { TSocialMedia } from '@/shared/constants/social-media-taxonomy';

import InstagramIcon from '@/shared/assets/icons/social-media/instagram.svg?react';
import TiktokIcon from '@/shared/assets/icons/social-media/tiktok.svg?react';
import FacebookIcon from '@/shared/assets/icons/social-media/facebook.svg?react';
import YoutubeIcon from '@/shared/assets/icons/social-media/youtube.svg?react';
import SoundcloudIcon from '@/shared/assets/icons/social-media/soundcloud.svg?react';
import SpotifyIcon from '@/shared/assets/icons/social-media/spotify.svg?react';
import PressIcon from '@/shared/assets/icons/social-media/press.svg?react';

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const SOCIAL_MEDIA_ICONS = {
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  soundcloud: SoundcloudIcon,
  spotify: SpotifyIcon,
  press: PressIcon,
} satisfies Record<TSocialMedia, SvgIcon>;
