import React from "react";
import { FilterOffersByPlatforms } from "@/features/influencers-offers/filter-offers-by-platforms";
import type { TPlatform } from "@/features/influencers-offers/filter-offers-by-platforms/model/platform.config.ts";

import s from './platform-filter-bar.module.scss';

interface PlatformsFilterBarProps {
  platform: TPlatform;
  onPlatformChange: (platform: TPlatform) => void;
}

export const PlatformsFilterBar: React.FC<PlatformsFilterBarProps> = ({
  platform,
  onPlatformChange,
}) => {
  return (
    <div className={s.bar}>
      <span className={s.label}>Choose your platforms</span>

      <FilterOffersByPlatforms
        platform={platform}
        onPlatformChange={onPlatformChange}
      />
    </div>
  );
};
