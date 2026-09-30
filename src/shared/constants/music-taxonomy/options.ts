import {
  COMMUNITY_MUSIC_GENRES,
  COMMUNITY_THEME_TOPICS,
  CREATOR_MUSIC_GENRES,
  CREATOR_CONTENT_FOCUS,
  COMMUNITY_MUSIC_GENRE_LABELS,
  COMMUNITY_THEME_TOPIC_LABELS,
  CREATOR_MUSIC_GENRE_LABELS,
  CREATOR_CONTENT_FOCUS_LABELS,
  COMMUNITY_MUSIC_GENRES_GROUPS,
  CREATOR_MUSIC_GENRES_GROUPS,
  CREATOR_CONTENT_FOCUS_GROUPS,
} from "@/shared/constants/music-taxonomy";

import type {
  TTaxonomyOptions,
  TCommunityMusicGenre,
  TCommunityMusicGenreGroup,
  TCommunityThemeTopic,
  TCreatorMusicGenre,
  TCreatorMusicGenreGroup,
  TCreatorContentFocus,
  TCreatorContentFocusGroup,
} from "@/shared/constants/music-taxonomy";

export const MUSIC_GENRES_COMMUNITY_OPTIONS = [
  {
    value: COMMUNITY_MUSIC_GENRES_GROUPS.TECHNO,
    label: "Techno",
    children: [
      {
        value: COMMUNITY_MUSIC_GENRES.TECHNO_MELODIC_MINIMAL,
        label:
          COMMUNITY_MUSIC_GENRE_LABELS[
            COMMUNITY_MUSIC_GENRES.TECHNO_MELODIC_MINIMAL
            ],
      },
      {
        value: COMMUNITY_MUSIC_GENRES.TECHNO_HARD_PEAK,
        label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.TECHNO_HARD_PEAK],
      },
    ],
  },
  {
    value: COMMUNITY_MUSIC_GENRES_GROUPS.HOUSE,
    label: "House",
    children: [
      {
        value: COMMUNITY_MUSIC_GENRES.HOUSE_TECH_HOUSE,
        label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.HOUSE_TECH_HOUSE],
      },
      {
        value: COMMUNITY_MUSIC_GENRES.HOUSE_MELODIC_AFRO,
        label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.HOUSE_MELODIC_AFRO],
      },
    ],
  },
  {
    value: COMMUNITY_MUSIC_GENRES.EDM,
    label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.EDM],
  },
  {
    value: COMMUNITY_MUSIC_GENRES.DRUM_AND_BASS,
    label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.DRUM_AND_BASS],
  },
  {
    value: COMMUNITY_MUSIC_GENRES.BASS,
    label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.BASS],
  },
  {
    value: COMMUNITY_MUSIC_GENRES.PSY_TRANCE,
    label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.PSY_TRANCE],
  },
  {
    value: COMMUNITY_MUSIC_GENRES.DUBSTEP,
    label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.DUBSTEP],
  },
  {
    value: COMMUNITY_MUSIC_GENRES.HIP_HOP,
    label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.HIP_HOP],
  },
  {
    value: COMMUNITY_MUSIC_GENRES.POP,
    label: COMMUNITY_MUSIC_GENRE_LABELS[COMMUNITY_MUSIC_GENRES.POP],
  },
] satisfies TTaxonomyOptions<TCommunityMusicGenreGroup | TCommunityMusicGenre>;

export const THEME_TOPICS_OPTIONS = [
  {
    value: COMMUNITY_THEME_TOPICS.IBIZA,
    label: COMMUNITY_THEME_TOPIC_LABELS[COMMUNITY_THEME_TOPICS.IBIZA],
  },
  {
    value: COMMUNITY_THEME_TOPICS.DANCING,
    label: COMMUNITY_THEME_TOPIC_LABELS[COMMUNITY_THEME_TOPICS.DANCING],
  },
  {
    value: COMMUNITY_THEME_TOPICS.MEME,
    label: COMMUNITY_THEME_TOPIC_LABELS[COMMUNITY_THEME_TOPICS.MEME],
  },
] satisfies TTaxonomyOptions<TCommunityThemeTopic>;

export const MUSIC_GENRES_CREATOR_OPTIONS = [
  {
    value: CREATOR_MUSIC_GENRES_GROUPS.ELECTRONIC_MUSIC,
    label: "Electronic Music",
    children: [
      {
        value: CREATOR_MUSIC_GENRES_GROUPS.TECHNO,
        label: "Techno",
        children: [
          {
            value: CREATOR_MUSIC_GENRES.ELECTRONIC_TECHNO_MELODIC_MINIMAL,
            label:
              CREATOR_MUSIC_GENRE_LABELS[
                CREATOR_MUSIC_GENRES.ELECTRONIC_TECHNO_MELODIC_MINIMAL
                ],
          },
          {
            value: CREATOR_MUSIC_GENRES.ELECTRONIC_TECHNO_HARD_PEAK,
            label:
              CREATOR_MUSIC_GENRE_LABELS[
                CREATOR_MUSIC_GENRES.ELECTRONIC_TECHNO_HARD_PEAK
                ],
          },
        ],
      },
      {
        value: CREATOR_MUSIC_GENRES_GROUPS.HOUSE,
        label: "House",
        children: [
          {
            value: CREATOR_MUSIC_GENRES.ELECTRONIC_HOUSE_TECH_HOUSE,
            label:
              CREATOR_MUSIC_GENRE_LABELS[
                CREATOR_MUSIC_GENRES.ELECTRONIC_HOUSE_TECH_HOUSE
                ],
          },
          {
            value: CREATOR_MUSIC_GENRES.ELECTRONIC_HOUSE_MELODIC_AFRO,
            label:
              CREATOR_MUSIC_GENRE_LABELS[
                CREATOR_MUSIC_GENRES.ELECTRONIC_HOUSE_MELODIC_AFRO
                ],
          },
        ],
      },
      {
        value: CREATOR_MUSIC_GENRES.ELECTRONIC_EDM,
        label: CREATOR_MUSIC_GENRE_LABELS[CREATOR_MUSIC_GENRES.ELECTRONIC_EDM],
      },
      {
        value: CREATOR_MUSIC_GENRES.ELECTRONIC_DRUM_AND_BASS,
        label:
          CREATOR_MUSIC_GENRE_LABELS[
            CREATOR_MUSIC_GENRES.ELECTRONIC_DRUM_AND_BASS
            ],
      },
      {
        value: CREATOR_MUSIC_GENRES.ELECTRONIC_BASS,
        label: CREATOR_MUSIC_GENRE_LABELS[CREATOR_MUSIC_GENRES.ELECTRONIC_BASS],
      },
      {
        value: CREATOR_MUSIC_GENRES.ELECTRONIC_PSY_TRANCE,
        label:
          CREATOR_MUSIC_GENRE_LABELS[
            CREATOR_MUSIC_GENRES.ELECTRONIC_PSY_TRANCE
            ],
      },
      {
        value: CREATOR_MUSIC_GENRES.ELECTRONIC_DUBSTEP,
        label:
          CREATOR_MUSIC_GENRE_LABELS[
            CREATOR_MUSIC_GENRES.ELECTRONIC_DUBSTEP
            ],
      },
    ],
  },
  {
    value: CREATOR_MUSIC_GENRES_GROUPS.MAINSTREAM_MUSIC,
    label: "Mainstream Music",
    children: [
      {
        value: CREATOR_MUSIC_GENRES.MAINSTREAM_POP,
        label: CREATOR_MUSIC_GENRE_LABELS[CREATOR_MUSIC_GENRES.MAINSTREAM_POP],
      },
      {
        value: CREATOR_MUSIC_GENRES.MAINSTREAM_HIP_HOP,
        label:
          CREATOR_MUSIC_GENRE_LABELS[CREATOR_MUSIC_GENRES.MAINSTREAM_HIP_HOP],
      },
      {
        value: CREATOR_MUSIC_GENRES.MAINSTREAM_ARABIC,
        label:
          CREATOR_MUSIC_GENRE_LABELS[CREATOR_MUSIC_GENRES.MAINSTREAM_ARABIC],
      },
      {
        value: CREATOR_MUSIC_GENRES.MAINSTREAM_K_POP,
        label:
          CREATOR_MUSIC_GENRE_LABELS[CREATOR_MUSIC_GENRES.MAINSTREAM_K_POP],
      },
      {
        value: CREATOR_MUSIC_GENRES.MAINSTREAM_METAL_ROCK,
        label:
          CREATOR_MUSIC_GENRE_LABELS[
            CREATOR_MUSIC_GENRES.MAINSTREAM_METAL_ROCK
            ],
      },
      {
        value: CREATOR_MUSIC_GENRES.MAINSTREAM_LATIN,
        label:
          CREATOR_MUSIC_GENRE_LABELS[CREATOR_MUSIC_GENRES.MAINSTREAM_LATIN],
      },
    ],
  },
] satisfies TTaxonomyOptions<TCreatorMusicGenreGroup | TCreatorMusicGenre>;

export const CONTENT_FOCUS_OPTIONS = [
  {
    value: CREATOR_CONTENT_FOCUS_GROUPS.MUSIC,
    label: "Music",
    children: [
      {
        value: CREATOR_CONTENT_FOCUS.MUSIC_DANCE,
        label: CREATOR_CONTENT_FOCUS_LABELS[CREATOR_CONTENT_FOCUS.MUSIC_DANCE],
      },
      {
        value: CREATOR_CONTENT_FOCUS.MUSIC_LIPSYNC,
        label: CREATOR_CONTENT_FOCUS_LABELS[CREATOR_CONTENT_FOCUS.MUSIC_LIPSYNC],
      },
      {
        value: CREATOR_CONTENT_FOCUS.MUSIC_REACTIONS,
        label: CREATOR_CONTENT_FOCUS_LABELS[CREATOR_CONTENT_FOCUS.MUSIC_REACTIONS],
      },
      {
        value: CREATOR_CONTENT_FOCUS.MUSIC_LYRICS,
        label: CREATOR_CONTENT_FOCUS_LABELS[CREATOR_CONTENT_FOCUS.MUSIC_LYRICS],
      },
    ],
  },
  {
    value: CREATOR_CONTENT_FOCUS_GROUPS.ENTERTAINMENT,
    label: "Entertainment",
    children: [
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_LIFESTYLE,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_LIFESTYLE
            ],
      },
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_FASHION,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_FASHION
            ],
      },
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_FITNESS_SPORT,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_FITNESS_SPORT
            ],
      },
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_BEAUTY,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_BEAUTY
            ],
      },
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_TRAVEL,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_TRAVEL
            ],
      },
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_FAMILY,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_FAMILY
            ],
      },
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_COMEDY,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_COMEDY
            ],
      },
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_COSPLAY,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_COSPLAY
            ],
      },
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_FOOD,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_FOOD
            ],
      },
      {
        value: CREATOR_CONTENT_FOCUS.ENTERTAINMENT_ART,
        label:
          CREATOR_CONTENT_FOCUS_LABELS[
            CREATOR_CONTENT_FOCUS.ENTERTAINMENT_ART
            ],
      },
    ],
  },
] satisfies TTaxonomyOptions<TCreatorContentFocus | TCreatorContentFocusGroup>;
