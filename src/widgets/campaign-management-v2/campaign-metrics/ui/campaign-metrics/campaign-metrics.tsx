import { MetricCard } from "../metric-card/metric-card.tsx";
import { CampaignBrief } from "../campaign-brief/campaign-brief.tsx";
import { CampaignInsights } from "../campaign-insights/campaign-insights.tsx";
import { CampaignPerformance } from "../campaign-performance/campaign-performance.tsx";

import File from '@/shared/assets/icons/file.svg?react';
import BarChart from '@/shared/assets/icons/bar-chart.svg?react';
import Activity from '@/shared/assets/icons/activity.svg?react';

import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";
import type { TCurrency } from "@/shared/constants/currency-taxonomy.ts";

import s from './campaign-metrics.module.scss';


interface CampaignMetricsProps {
  campaign: ICampaignDetails;
  reach: number;
  onPriceHiddenChange: (hidden: boolean) => void;
  onCpmAndResultHiddenChange: (hidden: boolean) => void;
  onPriceChange: (price: number) => void;
  onCurrencyChange: (currency: TCurrency) => void;
  readOnly: boolean;
}

export const CampaignMetrics = ({
  campaign,
  reach,
  onPriceHiddenChange,
  onCpmAndResultHiddenChange,
  onPriceChange,
  onCurrencyChange,
  readOnly,
}: CampaignMetricsProps) => {
  const budgetPrice =
    campaign.pricesByCurrency?.[campaign.displayCurrency] ??
    campaign.price;

  const canChangeCurrency = !readOnly && campaign.pricesByCurrency != null;
  
  return (
    <div className={s.cards}>
      <MetricCard title="Brief" icon={<File />}>
        <CampaignBrief
          readOnly={readOnly}
          submitted={campaign.creationDate}
          followers={reach}
          price={budgetPrice}
          currency={campaign.displayCurrency}
          canChangeCurrency={canChangeCurrency}
          onPriceChange={onPriceChange}
          numberOfVideos={campaign.campaignContent.length}
          numberOfPosts={campaign.addedAccounts.length}
          onCurrencyChange={onCurrencyChange}
          isHidePrice={campaign.isPriceHidden}
          onPriceHiddenChange={onPriceHiddenChange}
        />
      </MetricCard>
      
      <MetricCard title="Insights" icon={<BarChart />}>
        <CampaignInsights
          impressions={campaign.totalImpressions}
          comments={campaign.totalComments}
          likes={campaign.totalLikes}
          shares={campaign.totalShares}
          saves={campaign.totalSaves}
        />
      </MetricCard>      
      
      <MetricCard title="Performance" icon={<Activity />}>
        <CampaignPerformance
          cpm={campaign.cpm}
          isHideCpmAndResult={campaign.isCpmAndResultHidden}
          onCpmAndResultHiddenChange={onCpmAndResultHiddenChange}
        />
      </MetricCard>
    </div>
  );
};
