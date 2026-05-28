import React from "react";
import { toast } from "react-toastify";
import { useUpdateCampaignMutation } from "@/entities/campaign/api/use-update-campaign-mutation.ts";
import type { TCampaignStatus } from "@/entities/campaign";

import check from '@/assets/icons/check.svg';
import s from './confirm-campaign-report-sent.module.scss';

interface ConfirmCampaignReportSentProps {
  campaignId: string;
  status: TCampaignStatus;

  className?: string;
}

export const ConfirmCampaignReportSent: React.FC<ConfirmCampaignReportSentProps> = ({
  campaignId,
  status,
  className,
}) => {
  const { mutate, isPending } = useUpdateCampaignMutation();

  const handleClick = () => {
    mutate({
        campaignId,
        status,
        dto: {
          reportSent: true,
        },
      },
      {
        onSuccess: () => {
          toast("Campaign report marked as sent",
            {
              type: "success",
              position: "top-right",
              autoClose: 3000,
            },
          );
        },
      },
    );
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={isPending}
    >
      <img
        className={s.icon}
        src={check}
        alt={'Check'}
        width={16}
        height={16}
      />
    </button>
  );
};
