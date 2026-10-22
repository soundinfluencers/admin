import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@/shared/ui/v2/button-v2";

import RotateIcon from "@/shared/assets/icons/rotate.svg?react";
import SaveIcon from "@/shared/assets/icons/save.svg?react";

import {
  CAMPAIGN_STATUS_LABELS,
  type TCampaignStatus,
} from "@/entities/campaign/model/campaign-details.types.ts";

import {
  CURRENCY_LABELS,
  type TCurrency,
} from "@/shared/constants/currency-taxonomy.ts";

import s from './campaign-header.module.scss';

interface CampaignHeaderProps {
  onSave: () => void;
  isSaveDisabled: boolean;
  isDirty: boolean;
  isSaving: boolean;
  campaignName: string;
  onCampaignNameChange: (campaignName: string) => void;
  campaignStatus: TCampaignStatus;
  internalCost: number;
  currency: TCurrency;
  onReset: () => void;
  isResetDisabled: boolean;
  readOnly: boolean;
  isEditingDisabled?: boolean;
}

export const CampaignHeader = ({
  onSave,
  isSaving,
  isSaveDisabled,
  isDirty,
  campaignName,
  onCampaignNameChange,
  campaignStatus,
  internalCost,
  currency,
  onReset,
  isResetDisabled,
  readOnly,
  isEditingDisabled = false,
}: CampaignHeaderProps) => {
  const [draft, setDraft] = useState(campaignName);
  const [wasEditingDisabled, setWasEditingDisabled] = useState(isEditingDisabled);
  const skipNextBlurSaveRef = useRef(false);
  const saveDisabledReason = !isDirty && !isSaving ? "No changes to save" : undefined;

  useEffect(() => {
    setDraft(campaignName);
  }, [campaignName]);

  if (wasEditingDisabled !== isEditingDisabled) {
    setWasEditingDisabled(isEditingDisabled);
    setDraft(campaignName);
  }

  const handleBlur = () => {
    if (readOnly || isEditingDisabled) {
      skipNextBlurSaveRef.current = false;
      setDraft(campaignName);
      return;
    }

    if (skipNextBlurSaveRef.current) {
      skipNextBlurSaveRef.current = false;
      return;
    }

    const nextValue = draft.trim();

    if (nextValue === "") {
      setDraft(campaignName);
      return;
    }

    setDraft(nextValue);

    if (nextValue === campaignName) return;

    onCampaignNameChange(nextValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly || isEditingDisabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      skipNextBlurSaveRef.current = true;
      setDraft(campaignName);
      e.currentTarget.blur();
    }
  };

  const normalizedPendingStatus = campaignStatus === "pending" || campaignStatus === "under_review"
    ? "under_review"
    : campaignStatus;

  const statusLabel = CAMPAIGN_STATUS_LABELS[normalizedPendingStatus];

  return (
    <div className={s.header}>
      <h1 className="visually-hidden">{campaignName}</h1>

      <div className={s.headerLeft}>
        <input
          id="campaign-name"
          className={s.input}
          type="text"
          readOnly={readOnly || isEditingDisabled}
          value={readOnly || isEditingDisabled ? campaignName : draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />

        <div className={clsx(s.campaignStatus, {
          [s.underReview]: campaignStatus === "under_review" || campaignStatus === "pending",
          [s.distributing]: campaignStatus === "distributing",
          [s.completed]: campaignStatus === "completed",
          [s.proposal]: campaignStatus === "proposal",
          // [s.pause]: campaignStatus === "pause",
        })}>
          <span>{statusLabel}</span>
        </div>
      </div>

      <div className={s.headerRight}>
        <span className={s.internalCost}>Internal cost: {internalCost}{CURRENCY_LABELS[currency]}</span>

        {!readOnly && (
          <>
            <Button
              label="Reset"
              icon={RotateIcon}
              disabled={isResetDisabled}
              aria-label="Reset changes"
              onClick={onReset}
            />
            
            <span
              className={s.saveAction}
              title={saveDisabledReason}
            >
              <Button
                variant="primary"
                label="Save"
                loadingLabel="Saving…"
                icon={SaveIcon}
                isLoading={isSaving}
                disabled={isSaveDisabled || isSaving}
                aria-label="Save campaign changes"
                aria-description={saveDisabledReason}
                onClick={onSave}
              />
            </span>
          </>
        )}
      </div>
    </div>
  );
};
