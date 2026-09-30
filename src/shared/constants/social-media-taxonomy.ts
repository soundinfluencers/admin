export const SOCIAL_MEDIA = {
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook',
  SPOTIFY: 'spotify',
  SOUNDCLOUD: 'soundcloud',
  PRESS: 'press',
} as const;

export type TSocialMedia = (typeof SOCIAL_MEDIA)[keyof typeof SOCIAL_MEDIA];

export const SOCIAL_MEDIA_LABELS = {
  [SOCIAL_MEDIA.INSTAGRAM]: 'Instagram',
  [SOCIAL_MEDIA.TIKTOK]: 'TikTok',
  [SOCIAL_MEDIA.YOUTUBE]: 'YouTube',
  [SOCIAL_MEDIA.FACEBOOK]: 'Facebook',
  [SOCIAL_MEDIA.SPOTIFY]: 'Spotify',
  [SOCIAL_MEDIA.SOUNDCLOUD]: 'SoundCloud',
  [SOCIAL_MEDIA.PRESS]: 'Press',
} satisfies Record<TSocialMedia, string>;
