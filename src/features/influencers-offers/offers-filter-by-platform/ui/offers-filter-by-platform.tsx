import React from "react";
import clsx from "clsx";
import { HorizontalScroll } from "@/shared/ui";
import {
  OFFER_SOCIAL_MEDIA_OPTIONS,
  type TOfferSocialMedia,
} from "@/features/influencers-offers/offers-filter-by-platform";

import s from './offers-filter-by-platform.module.scss';

interface OffersFilterByPlatformProps {
  value: TOfferSocialMedia;
  onFilterChange: (value: TOfferSocialMedia) => void;
  isDisabled?: boolean;
}

export const OffersFilterByPlatform: React.FC<OffersFilterByPlatformProps> = ({
  value,
  onFilterChange,
  isDisabled,
}) => {
  return (
    <HorizontalScroll label={"Choose your platforms"}>
      <ul className={s.list}>
        {OFFER_SOCIAL_MEDIA_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;

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
                <Icon className={s.icon}/>

                <span>{option.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </HorizontalScroll>
  );
};
