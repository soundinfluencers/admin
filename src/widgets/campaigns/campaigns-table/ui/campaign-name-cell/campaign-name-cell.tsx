import React from "react";
import { getSocialMediaIcon } from "@/shared/libs/get-social-media-icon.ts";
import type { TSocialMedia } from "@/shared/types/types.ts";

import styles from './campaign-name-cell.module.scss';
import { Link } from "react-router-dom";
import type { TCampaignStatus } from "@/entities/campaign";

interface CampaignNameCellProps {
  campaignName: string;
  socialMedia: TSocialMedia;
  status: TCampaignStatus
  campaignId: string;
}

export const CampaignNameCell: React.FC<CampaignNameCellProps> = ({
  campaignName,
  socialMedia,
  status,
  campaignId,
}) => {
  return (
    <Link
      to={`/dashboard/campaigns/campaign-management/${status}/${campaignId}`}
      className={styles.campaignNameCell}
      title={campaignName}
    >
      <img
        src={getSocialMediaIcon(socialMedia)}
        alt={socialMedia}
        width={24}
        height={24}
      />
      <span className={styles.cellText}>
        {campaignName}
      </span>
    </Link>
  );
}
