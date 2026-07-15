import {
  OFFER_CREATOR_MUSIC_GENRES,
  OFFER_MUSIC_GENRES,
  type TOfferCreatorMusicGenre,
  type TOfferMusicGenre,
} from "./enums";

import {
  OFFER_CREATOR_MUSIC_GENRES_OPTIONS,
  OFFER_MUSIC_GENRES_OPTIONS,
} from "./options";

import type { TOfferGenreConfig } from "./types";

export const OFFER_MUSIC_GENRES_CONFIG = {
  options: OFFER_MUSIC_GENRES_OPTIONS,
  defaultValue:
  OFFER_MUSIC_GENRES.TECHNO_MELODIC_MINIMAL,
} satisfies TOfferGenreConfig<TOfferMusicGenre>;

export const OFFER_CREATOR_MUSIC_GENRES_CONFIG = {
  options: OFFER_CREATOR_MUSIC_GENRES_OPTIONS,
  defaultValue:
  OFFER_CREATOR_MUSIC_GENRES
    .ELECTRONIC_TECHNO_MELODIC_MINIMAL,
} satisfies TOfferGenreConfig<TOfferCreatorMusicGenre>;
