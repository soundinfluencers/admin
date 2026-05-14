import React, { useCallback, useEffect, useRef, useState } from "react";
import { FilterOffersByGenres } from "@/features/influencers-offers/filter-offers-by-genres";
import clsx from "clsx";
import type { TGenres } from "@/features/influencers-offers/filter-offers-by-genres/model/genres.config.ts";
import type {
  FilterOffersByGenresRef,
} from "@/features/influencers-offers/filter-offers-by-genres/ui/filter-offers-by-genres.tsx";

import chevron from '@/assets/icons/chevron-right.svg'

import s from './genre-filter-bar.module.scss';

interface GenreFilterBarProps {
  genre: TGenres;
  onGenreChange: (genre: TGenres) => void;
  isDisabled?: boolean;
}

export const GenreFilterBar: React.FC<GenreFilterBarProps> = ({
  genre,
  onGenreChange,
  isDisabled,
}) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const genresRef = useRef<FilterOffersByGenresRef>(null);

  const updateScrollState = useCallback(() => {
    const container = genresRef.current?.getContainer();

    if (!container) return;

    const isAtStart = container.scrollLeft <= 0;

    const isAtEnd =
      container.scrollLeft + container.clientWidth >=
      container.scrollWidth - 1;

    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);
  }, []);

  useEffect(() => {
    const container = genresRef.current?.getContainer();

    if (!container) return;

    const frameId = requestAnimationFrame(updateScrollState);

    container.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      cancelAnimationFrame(frameId);

      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  return (
    <div className={s.bar}>
      <div className={s.label}>
        Select your music genre
        <div className={s.chevrons}>

          <button
            type="button"
            className={clsx(
              s.chevron,
              !canScrollLeft && s.hidden,
            )}
            onClick={() => genresRef.current?.scrollLeft()}
            aria-label="slide-left"
          >
            <img
              className={s.chevronLeft}
              src={chevron}
              width={24}
              height={24}
              alt=""
              aria-hidden
            />
          </button>


          <button
            type="button"
            className={clsx(
              s.chevron,
              !canScrollRight && s.hidden,
            )}
            onClick={() => genresRef.current?.scrollRight()}
            aria-label="slide-right"
          >
            <img
              className={s.chevronRight}
              src={chevron}
              width={24}
              height={24}
              alt=""
              aria-hidden
            />
          </button>

        </div>
      </div>

      <FilterOffersByGenres
        ref={genresRef}
        genre={genre}
        onGenreChange={onGenreChange}
        isDisabled={isDisabled}
      />
    </div>
  );
};
