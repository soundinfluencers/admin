import { formatCampaignResult } from "../../libs/format-campaign-result.ts";
import { formatCpm } from "../../libs/format-cpm.ts";

import Eye from '@/shared/assets/icons/eye.svg?react';
import EyeClose from '@/shared/assets/icons/eye-off.svg?react';

import s from '../metric-content.module.scss';
import { IconButton } from "@/shared/ui/v2/icon-button";

interface CampaignPerformanceProps {
  disabled?: boolean;
  cpm: number;
  isHideCpmAndResult: boolean;
  onCpmAndResultHiddenChange: (hidden: boolean) => void;
}

export const CampaignPerformance = ({
  disabled = false,
  cpm,
  isHideCpmAndResult,
  onCpmAndResultHiddenChange,
}: CampaignPerformanceProps) => {
  return (
    <dl className={s.list}>
      <div className={s.row}>
        <dt className={s.label}>CPM:</dt>
        <dd className={s.value}>
          {isHideCpmAndResult ? "••••" : formatCpm(cpm)}
        </dd>

        <IconButton
          className={s.hideBtn}
          icon={isHideCpmAndResult ? EyeClose : Eye}
          aria-label={isHideCpmAndResult ? "Show cpm and result" : "Hide cpm and result"}
          disabled={disabled}
          onClick={() => onCpmAndResultHiddenChange(!isHideCpmAndResult)}
        />
      </div>

      <div className={s.row}>
        <dt className={s.label}>Instagram benchmark:</dt>
        <dd className={s.value}>5€ to 12€</dd>
      </div>

      <div className={s.row}>
        <dt className={s.label}>Result:</dt>
        <dd className={s.value}>
          {isHideCpmAndResult ? "••••" : formatCampaignResult(cpm)}
        </dd>
      </div>
    </dl>
  );
};
