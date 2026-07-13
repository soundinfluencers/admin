import type { TOfferMusicGenre } from "./enums";

export type TOfferGenreOption = {
  value: TOfferMusicGenre;
  label: string;
  subLabel?: string;
};
