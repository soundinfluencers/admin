import { PageBreadcrumbs } from "@/shared/ui/v2/page-breadcrumbs-v2/page-breadcrumbs.tsx";
import { useEffect, useRef, useState, type Ref } from "react";
import { toast } from "react-toastify";
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard";
import { Button } from "@/shared/ui/v2/button-v2";

import ImportIcon from "@/shared/assets/icons/import.svg?react";
import RefreshIcon from '@/shared/assets/icons/refresh.svg?react';
import LinkIcon from "@/shared/assets/icons/link.svg?react";
import BurgerIcon from "@/shared/assets/icons/burger-menu.svg?react";

import s from './campaign-navigation.module.scss';

interface CampaignNavigationProps {
  items: { label: string; to?: string }[];
  shareLink?: string;
  isUpdatingInsights: boolean;
  isPreparingInsights: boolean;
  isUpdateInsightsDisabled: boolean;
  onUpdateInsights: () => void;
  canImportXlsx: boolean;
  isImportXlsxDisabled: boolean;
  onImportXlsx: () => void;
  importButtonRef?: Ref<HTMLButtonElement>;
  hasData: boolean;
  disabled?: boolean;
  onMenuClick: () => void;
  isMenuOpen: boolean;
  menuButtonRef?: Ref<HTMLButtonElement>;
  showManagementActions?: boolean;
  canUpdateInsights: boolean;
}

export const CampaignNavigation = ({
  items,
  shareLink,
  isUpdatingInsights,
  isPreparingInsights,
  isUpdateInsightsDisabled,
  onUpdateInsights,
  canImportXlsx,
  isImportXlsxDisabled,
  onImportXlsx,
  importButtonRef,
  hasData,
  disabled,
  onMenuClick,
  isMenuOpen,
  menuButtonRef,
  showManagementActions = true,
  canUpdateInsights,
}: CampaignNavigationProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyToClipboard = useCopyToClipboard();

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const copyShareLink = async () => {
    if (!shareLink) return;

    if (copiedTimeoutRef.current !== null) {
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = null;
    }
    
    setIsCopied(false);

    const success = await copyToClipboard(shareLink);

    if (success) {
      setIsCopied(true);
      
      copiedTimeoutRef.current = setTimeout(() => {
        copiedTimeoutRef.current = null;
        setIsCopied(false);
      }, 1000);
    } else {
      toast.error("Could not copy the link.");
    }
  };

  return (
    <div className={s.navigation}>
      <PageBreadcrumbs items={items}/>

      <div className={s.actions}>
        {showManagementActions && canImportXlsx && hasData && (
          <Button
            ref={importButtonRef}
            label="Import XLSX"
            icon={ImportIcon}
            aria-haspopup="dialog"
            disabled={disabled || isImportXlsxDisabled}
            onClick={onImportXlsx}
          />
        )}
        
        {showManagementActions && canUpdateInsights && hasData && (
          <Button
            label="Update insights"
            loadingLabel="Updating…"
            isLoading={isUpdatingInsights || isPreparingInsights}
            icon={RefreshIcon}
            onClick={onUpdateInsights}
            disabled={isUpdateInsightsDisabled || disabled}
          />
        )}

        {hasData && (
          <span
            className={s.shareAction}
            title={!shareLink ? "Share link is unavailable" : undefined}
          >
            <Button
              label={isCopied ? "Copied" : "Share link"}
              reserveLabel="Share link"
              icon={LinkIcon}
              onClick={() => void copyShareLink()}
              disabled={disabled || !shareLink}
              aria-description={!shareLink ? "Share link is unavailable" : undefined}
            />
          </span>
        )}

        {showManagementActions && hasData && (
          <Button
            ref={menuButtonRef}
            label="Menu"
            icon={BurgerIcon}
            aria-label="Open campaign menu"
            aria-haspopup="dialog"
            aria-expanded={isMenuOpen}
            disabled={disabled}
            onClick={onMenuClick}
          />
        )}
      </div>
    </div>
  );
};
