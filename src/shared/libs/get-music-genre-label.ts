import {
  COMMUNITY_MUSIC_GENRE_LABELS,
  COMMUNITY_THEME_TOPIC_LABELS,
  CREATOR_MUSIC_GENRE_LABELS,
  CREATOR_CONTENT_FOCUS_LABELS,
} from "@/shared/constants/music-taxonomy";

const musicGenreLabels = new Map<string, string>([
  ...Object.entries(COMMUNITY_MUSIC_GENRE_LABELS),
  ...Object.entries(CREATOR_MUSIC_GENRE_LABELS),
  ...Object.entries(COMMUNITY_THEME_TOPIC_LABELS),
  ...Object.entries(CREATOR_CONTENT_FOCUS_LABELS),
]);

export const getMusicGenreLabel = (genre: string): string => {
  return musicGenreLabels.get(genre) ?? genre;
};
