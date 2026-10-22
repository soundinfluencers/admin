import { BudgetControl } from "../../../ui/budget-control/budget-control.tsx";
import { formatCampaignDate } from "../../../libs/format-campaign-date.ts";
import { formatCompactNumber } from "@/shared/libs/format/format-compact-number.ts";

import type { TCurrency } from "@/shared/constants/currency-taxonomy.ts";

import Eye from '@/shared/assets/icons/eye.svg?react';
import EyeClose from '@/shared/assets/icons/eye-off.svg?react';

import s from '../metric-content.module.scss';
import { IconButton } from "@/shared/ui/v2/icon-button";

interface CampaignBriefProps {
  readOnly: boolean;
  isBudgetDisabled: boolean;
  submitted: string;
  followers: number;
  price: number;
  onPriceChange: (price: number) => void;
  numberOfVideos: number;
  numberOfPosts: number;
  currency: TCurrency;
  onCurrencyChange: (currency: TCurrency) => void;
  isHidePrice: boolean;
  canChangeCurrency: boolean;
  onPriceHiddenChange: (hidden: boolean) => void;
}

export const CampaignBrief = ({
  readOnly,
  isBudgetDisabled,
  submitted,
  followers,
  price,
  onPriceChange,
  numberOfVideos,
  numberOfPosts,
  currency,
  onCurrencyChange,
  isHidePrice,
  canChangeCurrency,
  onPriceHiddenChange,
}: CampaignBriefProps) => {
  return (
    <dl className={s.list}>
      <div className={s.row}>
        <dt className={s.label}>Submitted:</dt>
        <dd className={s.value}>{formatCampaignDate(submitted)}</dd>
      </div>

      <div className={s.row}>
        <dt className={s.label}>Reach:</dt>
        <dd
          className={s.value}
          title={String(followers)}
        >
          {formatCompactNumber(followers)} followers
        </dd>
      </div>

      <div className={s.row}>
        <dt className={s.label}>Budget:</dt>
        <dd className={s.value}>
          {isHidePrice ?  "••••" : (
            <BudgetControl
              disabled={isBudgetDisabled}
              readOnly={readOnly}
              price={price} 
              currency={currency}
              canChangeCurrency={canChangeCurrency}
              onPriceChange={onPriceChange} 
              onCurrencyChange={onCurrencyChange} 
            />
          )}
        </dd>
        
        <IconButton
          className={s.hideBtn}
          icon={isHidePrice ? EyeClose : Eye}
          aria-label={isHidePrice ? "Show budget" : "Hide budget"}
          disabled={isBudgetDisabled}
          onClick={() => onPriceHiddenChange(!isHidePrice)}
        />
      </div>

      <div className={s.row}>
        <dt className={s.label}>Content plan:</dt>
        <dd className={s.value}>
          {numberOfVideos} videos · {numberOfPosts} posts
        </dd>
      </div>
    </dl>
  );
};
