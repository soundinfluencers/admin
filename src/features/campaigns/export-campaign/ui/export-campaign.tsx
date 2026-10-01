import React from "react";
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard.ts";
import { toast } from "react-toastify";
import type { TSocialMedia } from "@/shared/types/types.ts";
import exportCampaign from '@/assets/icons/campaigns/icons/upload.svg';

import s from './export-campaign.module.scss';

interface ExportCampaignProps {
  campaignId: string;
  socialMedia: TSocialMedia;
  className?: string;
}

export const ExportCampaign: React.FC<ExportCampaignProps> = ({ campaignId, socialMedia, className = "" }) => {
  const copyToClipboard = useCopyToClipboard();

  const sharedLink = `https://go.soundinfluencers.com/promo-share/${campaignId}/${socialMedia}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(sharedLink);

    if (success) {
      toast("Campaign link copied to clipboard!",
        { type: "success", position: "top-right", autoClose: 3000 });
    } else {
      toast('Failed to copy campaign link. Please try again.',
        { type: "error", position: "top-right", autoClose: 3000 });
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
    >
      <img
        className={s.icon}
        src={exportCampaign}
        alt="Export Campaign"
        width={18}
        height={18}
      />
    </button>
  );
};
