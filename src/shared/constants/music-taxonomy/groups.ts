export const COMMUNITY_MUSIC_GENRES_GROUPS = {
  TECHNO: "techno",
  HOUSE: "house",
} as const;

export const CREATOR_MUSIC_GENRES_GROUPS = {
  ELECTRONIC_MUSIC: "electronic_music",
  TECHNO: "techno",
  HOUSE: "house",
  MAINSTREAM_MUSIC: "mainstream_music",
} as const;

export const CREATOR_CONTENT_FOCUS_GROUPS = {
  MUSIC: "music",
  ENTERTAINMENT: "entertainment",
} as const;

export type TCommunityMusicGenreGroup =
  (typeof COMMUNITY_MUSIC_GENRES_GROUPS)[keyof typeof COMMUNITY_MUSIC_GENRES_GROUPS];

export type TCreatorMusicGenreGroup =
  (typeof CREATOR_MUSIC_GENRES_GROUPS)[keyof typeof CREATOR_MUSIC_GENRES_GROUPS];

export type TCreatorContentFocusGroup =
  (typeof CREATOR_CONTENT_FOCUS_GROUPS)[keyof typeof CREATOR_CONTENT_FOCUS_GROUPS];
