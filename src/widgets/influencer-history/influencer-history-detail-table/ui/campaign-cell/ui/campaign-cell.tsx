import React from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";

import type { TCampaignStatus } from "@/entities/campaign";

import s from './campaign-cell.module.scss';

interface CampaignCellProps {
  value: string | null;
  campaignId: string | null;
  campaignStatus: TCampaignStatus | null;
  isStillInCampaign?: boolean | null;
}

export const CampaignCell: React.FC<CampaignCellProps> = ({
  value,
  campaignId,
  campaignStatus,
  isStillInCampaign,
}) => {
  const displayValue = value ? value.trim() : "—";

  return (
    <Link
      to={`/dashboard/campaigns/campaign-management?status=${campaignStatus}&id=${campaignId}`}
      className={clsx(s.campaignCell, !isStillInCampaign && s.isCampaign)}
      title={displayValue}
    >
      <span className={s.text}>{displayValue}</span>
    </Link>
  );
};
