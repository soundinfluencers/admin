import React from "react";
import toggleIcon from '@/assets/icons/campaigns/icons/repeat.svg';
import type { TOffersMode } from "@/pages/influencers-offers-page/model/influencers-offers.query-parsers.ts";

import s from './toggle-offers-view.module.scss';

interface ToggleOffersViewProps {
  mode: TOffersMode;
  onToggle: () => void;
}

export const ToggleOffersView: React.FC<ToggleOffersViewProps> = ({
  mode,
  onToggle,
}) => {
  return (
    <button
      type="button"
      className={s.toggleBtn}
      onClick={onToggle}
      aria-label="Toggle offers view"
    >
      <img
        className={s.toggleIcon}
        src={toggleIcon}
        width={18}
        height={18}
        alt=""
        aria-hidden
      />
      {mode === 'offers' ? "Live offers edit mode" : "Offers pages selection"}
    </button>
  );
};
