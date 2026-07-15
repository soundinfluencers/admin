import type { TOfferGenre } from "./enums";

export type TOfferGenreOption<TGenre extends TOfferGenre = TOfferGenre> = {
  value: TGenre;
  label: string;
  subLabel?: string;
};

export type TOfferGenreConfig<
  TGenre extends TOfferGenre = TOfferGenre,
> = {
  options: readonly TOfferGenreOption<TGenre>[];
  defaultValue: TGenre;
};
