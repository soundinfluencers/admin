import React from "react";
import { ExportXlsx } from "@/features/influencers-offers/export-xlsx";
import { ToggleOffersView } from "@/features/influencers-offers/toggle-offers-view";
import { PublishOffers } from "@/features/influencers-offers/publish-offers";
import type { TOffersMode } from "@/pages/influencers-offers-page/model/influencers-offers.query-parsers.ts";

import s from './offers-matrix-actions.module.scss';

interface OffersMatrixActionsProps {
  mode: TOffersMode;
  onToggleOffersView: () => void;
}

export const OffersMatrixActions: React.FC<OffersMatrixActionsProps> = ({
  mode,
  onToggleOffersView,
}) => {
  return (
    <div className={s.actions}>
      <ExportXlsx/>

      <ToggleOffersView
        mode={mode}
        onToggle={onToggleOffersView}
      />

      <PublishOffers/>
    </div>
  )
};
