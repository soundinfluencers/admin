import { PageBreadcrumbs } from "@/shared/ui/v2/page-breadcrumbs-v2/page-breadcrumbs.tsx";
import RefreshIcon from '@/shared/assets/icons/refresh.svg?react';

import s from './campaign-navigation.module.scss';

interface CampaignNavigationProps {
  items: { label: string; to?: string }[];
  isUpdating?: boolean; // add loading state
}

export const CampaignNavigation = ({
  items,
  isUpdating,
}: CampaignNavigationProps) => {
  return (
    <div className={s.navigation}>
      <PageBreadcrumbs items={items} />
      
      <div className={s.actions}>
        <button
          className={s.action}
          type="button"
          onClick={() => alert("Function don`t implement yet!")}
          disabled={isUpdating}
          aria-busy={isUpdating}
        >
          <RefreshIcon 
            className={isUpdating ? s.spinning : undefined} 
            width={16} 
            height={16} 
            aria-hidden="true" 
          />
          Update insights
        </button>
        
        <button
          className={s.action}
          type="button"
          aria-label="Open side bar"
          onClick={() => alert("Function don`t implement yet!")}
        >
          Menu
        </button>
      </div>
    </div>
  );
};
