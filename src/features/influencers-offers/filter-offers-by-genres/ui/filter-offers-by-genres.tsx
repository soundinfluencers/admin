import React from "react";
import clsx from "clsx";
import {
  GENRES_OPTIONS,
  type TGenres,
} from "@/features/influencers-offers/filter-offers-by-genres/model/genres.config.ts";

import s from './filter-offers-by-genres.module.scss';

interface FilterOffersByGenresProps {
  genre: TGenres;
  onGenreChange: (genre: TGenres) => void;
}

export const FilterOffersByGenres: React.FC<FilterOffersByGenresProps> = ({
  genre,
  onGenreChange,
}) => {
  return (
    <div className={s.filterBar}>
      {GENRES_OPTIONS.map(option => (
        <button
          key={option.value}
          className={clsx(
            s.button,
            option.value === genre && s.active,
          )}
          type="button"
          onClick={() => onGenreChange(option.value)}
        >
          <span className={s.label}>{option.label}</span>
          {"subLabel" in option && (
            <span className={s.subLabel}>{option.subLabel}</span>
          )}
        </button>
      ))}
    </div>
  );
};
