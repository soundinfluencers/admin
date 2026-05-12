import React from "react";
import { FilterOffersByGenres } from "@/features/influencers-offers/filter-offers-by-genres";
import type { TGenres } from "@/features/influencers-offers/filter-offers-by-genres/model/genres.config.ts";

import s from './genre-filter-bar.module.scss';

interface GenreFilterBarProps {
  genre: TGenres;
  onGenreChange: (genre: TGenres) => void;
}

export const GenreFilterBar: React.FC<GenreFilterBarProps> = ({
  genre,
  onGenreChange,
}) => {
  return (
    <div className={s.bar}>
      <span className={s.label}>Select your music genre</span>

      <FilterOffersByGenres
        genre={genre}
        onGenreChange={onGenreChange}
      />
    </div>
  );
};
