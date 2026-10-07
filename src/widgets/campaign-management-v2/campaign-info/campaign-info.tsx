import { BudgetControl } from "../ui/budget-control/budget-control.tsx";
import { formatCampaignDate } from "../libs/format-campaign-date.ts";
import { formatCompactNumber } from "@/shared/libs/format/format-compact-number.ts";

import type { TCurrency } from "@/shared/constants/currency-taxonomy.ts";
import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

import s from './campaign-info.module.scss';

interface CampaignInfoProps {
  campaign: ICampaignDetails;
  readOnly: boolean;
  reach: number;
  onPriceChange: (price: number) => void;
  onCurrencyChange: (currency: TCurrency) => void;
}

export const CampaignInfo = ({
  campaign,
  readOnly,
  reach,
  onPriceChange,
  onCurrencyChange,
}: CampaignInfoProps) => {
  const budgetPrice =
    campaign.pricesByCurrency?.[campaign.displayCurrency] ??
    campaign.price;

  const canChangeCurrency = !readOnly && campaign.pricesByCurrency != null; 
  
  return (
    <dl className={s.summary}>
      <div className={s.item}>
        <dt className={s.label}>Submitted:</dt>
        <dd className={s.value}>{formatCampaignDate(campaign.creationDate)}</dd>
      </div>
      
      <div className={s.separatorContainer}>
        <span className={s.line}/>
        <span className={s.separator}/>
        <span className={s.line}/>
      </div>
      
      <div className={s.item}>
        <dt className={s.label}>Budget:</dt>
        <dd className={s.value}>
          <BudgetControl
            readOnly={readOnly}
            price={budgetPrice}
            currency={campaign.displayCurrency}
            canChangeCurrency={canChangeCurrency}
            onPriceChange={onPriceChange}
            onCurrencyChange={onCurrencyChange}
          />
        </dd>
      </div>

      <div className={s.separatorContainer}>
        <span className={s.line}/>
        <span className={s.separator}/>
        <span className={s.line}/>
      </div>
      
      <div className={s.item}>
        <dt className={s.label}>Reach:</dt>
        <dd className={s.value}>{formatCompactNumber(reach)} followers</dd>
      </div>

      <div className={s.separatorContainer}>
        <span className={s.line}/>
        <span className={s.separator}/>
        <span className={s.line}/>
      </div>
      
      <div className={s.item}>
        <dt className={s.label}>Posts:</dt>
        <dd className={s.value}>{campaign.addedAccounts.length}</dd>
      </div>

      <div className={s.separatorContainer}>
        <span className={s.line}/>
        <span className={s.separator}/>
        <span className={s.line}/>
      </div>
      
      <div className={s.item}>
        <dt className={s.label}>Videos:</dt>
        <dd className={s.value}>{campaign.campaignContent.length}</dd>
      </div>
    </dl>
  );
};

