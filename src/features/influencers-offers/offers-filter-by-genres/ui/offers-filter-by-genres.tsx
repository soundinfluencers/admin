import React from "react";
import clsx from "clsx";
import { HorizontalScroll } from "@/shared/ui";
import {
  OFFER_MUSIC_GENRES_OPTIONS,
  type TOfferMusicGenre,
} from "@/features/influencers-offers/offers-filter-by-genres";

import s from './offers-filter-by-genres.module.scss';

interface OffersFilterByGenresProps {
  value: TOfferMusicGenre;
  onFilterChange: (value: TOfferMusicGenre) => void;
  isDisabled?: boolean;
}

export const OffersFilterByGenres: React.FC<OffersFilterByGenresProps> = ({
  value,
  onFilterChange,
  isDisabled,
}) => {
  return (
    <HorizontalScroll label={"Select your music genre"}>
      <ul className={s.list}>
        {OFFER_MUSIC_GENRES_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <li key={option.value} className={s.item}>
              <button
                type="button"
                className={clsx(s.filter, {
                  [s.active]: isSelected,
                })}
                onClick={() => onFilterChange(option.value)}
                disabled={isDisabled}
              >
                <span className={s.label}>{option.label}</span>

                {"subLabel" in option && <span className={s.text}>{option.subLabel}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </HorizontalScroll>
  );
};
