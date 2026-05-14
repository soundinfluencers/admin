import { memo } from "react";
import clsx from "clsx";
import type { IOfferLink } from "@/entities/influencers-offers/model/influencers-offers.types.ts";

import s from "./offers-matrix-cell.module.scss";

interface OffersMatrixCellProps {
  link?: IOfferLink;
}

export const OffersMatrixCell = memo(({
  link,
}: OffersMatrixCellProps) => {
  return (
    <div className={clsx(s.cell, link && s.connected)}>
      {link ? "✓" : ""}
    </div>
  );
});
