import {
  OFFER_CREATOR_MUSIC_GENRES,
  OFFER_MUSIC_GENRES,
  type TOfferCreatorMusicGenre,
  type TOfferGenre,
  type TOfferMusicGenre,
} from "../constants";

const OFFER_MUSIC_GENRE_VALUES =
  Object.values(OFFER_MUSIC_GENRES);

const OFFER_CREATOR_MUSIC_GENRE_VALUES =
  Object.values(OFFER_CREATOR_MUSIC_GENRES);

export const isOfferMusicGenre = (
  value: TOfferGenre,
): value is TOfferMusicGenre => {
  return OFFER_MUSIC_GENRE_VALUES.includes(
    value as TOfferMusicGenre,
  );
};

export const isOfferCreatorMusicGenre = (
  value: TOfferGenre,
): value is TOfferCreatorMusicGenre => {
  return OFFER_CREATOR_MUSIC_GENRE_VALUES.includes(
    value as TOfferCreatorMusicGenre,
  );
};
