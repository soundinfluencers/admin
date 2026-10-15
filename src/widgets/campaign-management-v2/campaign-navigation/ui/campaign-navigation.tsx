import { PageBreadcrumbs } from "@/shared/ui/v2/page-breadcrumbs-v2/page-breadcrumbs.tsx";
import type { Ref } from "react";

import RefreshIcon from '@/shared/assets/icons/refresh.svg?react';

import s from './campaign-navigation.module.scss';

interface CampaignNavigationProps {
  items: { label: string; to?: string }[];
  isUpdating?: boolean; // add loading state
  disabled?: boolean;
  onMenuClick: () => void;
  isMenuOpen: boolean;
  menuButtonRef?: Ref<HTMLButtonElement>;
  showActions?: boolean;
}

export const CampaignNavigation = ({
  items,
  isUpdating,
  disabled,
  onMenuClick,
  isMenuOpen,
  menuButtonRef,
  showActions = true,
}: CampaignNavigationProps) => {
  return (
    <div className={s.navigation}>
      <PageBreadcrumbs items={items} />

      {showActions && (
        <div className={s.actions}>
          <button
            className={s.action}
            type="button"
            onClick={() => alert("Function don`t implement yet!")}
            disabled={isUpdating || disabled}
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
            ref={menuButtonRef}
            className={s.action}
            type="button"
            aria-label="Open campaign menu"
            aria-haspopup="dialog"
            aria-expanded={isMenuOpen}
            onClick={onMenuClick}
            disabled={disabled}
          >
            Menu
          </button>
        </div>
      )}
    </div>
  );
};
