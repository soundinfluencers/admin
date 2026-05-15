import { forwardRef, useImperativeHandle, useRef } from "react";
import clsx from "clsx";
import {
  GENRES_OPTIONS,
  type TGenres,
} from "@/features/influencers-offers/filter-offers-by-genres/model/genres.config.ts";

import s from './filter-offers-by-genres.module.scss';

export interface FilterOffersByGenresRef {
  scrollLeft: () => void;
  scrollRight: () => void;
  getContainer: () => HTMLDivElement | null;
}

interface FilterOffersByGenresProps {
  genre: TGenres;
  onGenreChange: (genre: TGenres) => void;
  isDisabled?: boolean;
}

const SCROLL_AMOUNT = 320;

export const FilterOffersByGenres = forwardRef<
  FilterOffersByGenresRef,
  FilterOffersByGenresProps
>(({
  genre,
  onGenreChange,
  isDisabled,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollLeft: () => {
      containerRef.current?.scrollBy({
        left: -SCROLL_AMOUNT,
        behavior: "smooth",
      });
    },

    scrollRight: () => {
      containerRef.current?.scrollBy({
        left: SCROLL_AMOUNT,
        behavior: "smooth",
      });
    },

    getContainer: () => containerRef.current,
  }));

  return (
    <div
      ref={containerRef}
      className={s.filterBar}
    >
      {GENRES_OPTIONS.map(option => (
        <button
          key={option.value}
          className={clsx(
            s.button,
            option.value === genre && s.active,
          )}
          type="button"
          onClick={() => onGenreChange(option.value)}
          disabled={isDisabled}
        >
          <span className={s.label}>{option.label}</span>

          {"subLabel" in option && (
            <span className={s.subLabel}>
              {option.subLabel}
            </span>
          )}
        </button>
      ))}
    </div>
  );
});
