import React from "react";
import clsx from "clsx";
import { PLATFORMS_OPTIONS, type TPlatform } from "@/features/influencers-offers/filter-offers-by-platforms/model/platform.config.ts";

import s from './filter-offers-by-platforms.module.scss';

interface FilterOffersByPlatformsProps {
  platform: TPlatform;
  onPlatformChange: (platform: TPlatform) => void;
}

export const FilterOffersByPlatforms: React.FC<FilterOffersByPlatformsProps> = ({
  platform,
  onPlatformChange,
}) => {
  return (
    <div className={s.filterBar}>
      {PLATFORMS_OPTIONS.map(option => (
        <button
          key={option.value}
          className={clsx(
            s.button,
            option.value === platform && s.active
          )}
          type="button"
          onClick={() => onPlatformChange(option.value)}
        >
          <img
            src={option.icon}
            alt={option.value}
            className={s.icon}
            width={22}
            height={22}
          />
          <span className={s.label}>{option.label}</span>
        </button>
      ))}
    </div>
  );
};
