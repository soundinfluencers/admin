import React from "react";
import clsx from "clsx";
import { getSocialMediaIcon } from "@/shared/libs/get-social-media-icon.ts";
import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

import s from './influencer-history-table-account-cell.module.scss';

interface InfluencerHistoryTableAccountCellProps {
  username: string;
  socialMedia: TSocialMediaValue;
  className?: string;
}

export const InfluencerHistoryTableAccountCell: React.FC<InfluencerHistoryTableAccountCellProps> = ({
  username,
  socialMedia,
  className,
}) => {

  const displayValue = username ? username.trim() : '—';

  return (
    <div
      className={clsx(s.accountCell, className)}
      title={displayValue}
    >
      <img
        className={s.icon}
        src={getSocialMediaIcon(socialMedia)}
        alt={socialMedia}
        width={20}
        height={20}
      />
      <span className={s.text}>{displayValue}</span>
    </div>
  )
};
