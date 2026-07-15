import clsx from "clsx";
import { HorizontalScroll } from "@/shared/ui";
import { type TOfferGenre, type TOfferGenreOption } from "@/features/influencers-offers/offers-filter-by-genres";

import s from './offers-filter-by-genres.module.scss';

interface OffersFilterByGenresProps {
  value: TOfferGenre;
  options: readonly TOfferGenreOption[];
  onFilterChange: (value: TOfferGenre) => void;
  isDisabled?: boolean;
}

export const OffersFilterByGenres = ({
  value,
  options,
  onFilterChange,
  isDisabled,
}: OffersFilterByGenresProps) => {
  return (
    <HorizontalScroll label={"Select your music genre"}>
      <ul className={s.list}>
        {options.map((option) => {
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
