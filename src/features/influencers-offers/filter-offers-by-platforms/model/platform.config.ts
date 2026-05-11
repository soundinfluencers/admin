import instagram from '@/assets/icons/influencers/social-media/instagram.svg';
import tiktok from '@/assets/icons/influencers/social-media/tiktok.svg';
import spotify from '@/assets/icons/influencers/social-media/spotify.svg';
import facebook from '@/assets/icons/influencers/social-media/facebook.svg';
import soundcloud from '@/assets/icons/influencers/social-media/soundcloud.svg';
import youtube from '@/assets/icons/influencers/social-media/youtube.svg';
import press from '@/assets/icons/influencers/social-media/press.svg';

export type TPlatform =
  | 'instagram'
  | 'tiktok'
  | 'tiktok_creator'
  | 'tiktok_communities'
  | 'spotify'
  | 'facebook'
  | 'soundcloud'
  | 'youtube'
  | 'press';

export const PLATFORMS_OPTIONS = [
  { label: "Instagram", value: "instagram", icon: instagram },
  { label: "TikTok Creators", value: "tiktok_creator", icon: tiktok },
  { label: "TikTok Communities ", value: "tiktok_communities", icon: tiktok },
  { label: "Spotify", value: "spotify", icon: spotify },
  { label: "Facebook", value: "facebook", icon: facebook },
  { label: "SoundCloud", value: "soundcloud", icon: soundcloud },
  { label: "YouTube", value: "youtube", icon: youtube },
  { label: "Press", value: "press", icon: press },
] as const satisfies {
  label: string;
  value: TPlatform;
  icon: string;
}[];

export type TPlatformOption = typeof PLATFORMS_OPTIONS[number];
