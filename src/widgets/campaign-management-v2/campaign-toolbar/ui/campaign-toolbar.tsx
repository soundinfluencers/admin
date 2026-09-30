import * as Tabs from '@radix-ui/react-tabs';
import { 
  CAMPAIGN_VIEWS,
  CAMPAIGN_VIEWS_LABELS,
  isCampaignView,
  type TCampaignView 
} from "@/shared/constants/campaign-view.ts";

import s from './campaign-toolbar.module.scss';

interface CampaignToolbarProps {
  value: TCampaignView;
  onValueChange: (value: TCampaignView) => void;
}

export const CampaignToolbar = ({
  value,
  onValueChange,
}: CampaignToolbarProps) => {
  const handleValueChange = (nextValue: string) => {
    if (isCampaignView(nextValue)) {
      onValueChange(nextValue);
    }
  };

  return (
    <div className={s.toolbar}>
      <div className={s.titleGroup}>
        <h2 className={s.title}>Content distribution</h2>
        <p className={s.subtitle}>Assign content and reusable copy to each influencer placement.</p>
      </div>

      <Tabs.Root
        className={s.tabs}
        value={value}
        defaultValue={value}
        onValueChange={handleValueChange}
      >
        <Tabs.List className={s.tabsList} aria-label="Campaign view">
          {CAMPAIGN_VIEWS.map((value) => (
            <Tabs.Trigger
              key={value}
              className={s.tabsTrigger}
              value={value}
            >
              {CAMPAIGN_VIEWS_LABELS[value]}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
    </div>
  );
};
