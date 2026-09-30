import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

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
  campaignName: string;
  onCampaignNameChange: (campaignName: string) => void;
  campaignStatus: TCampaignStatus;
  internalCost: number;
  currency: TCurrency;
  onReset: () => void;
  isResetDisabled: boolean;
}

export const CampaignHeader = ({
  campaignName,
  onCampaignNameChange,
  campaignStatus,
  internalCost,
  currency,
  onReset,
  isResetDisabled,
}: CampaignHeaderProps) => {
  const [draft, setDraft] = useState(campaignName);
  const skipNextBlurSaveRef = useRef(false);

  useEffect(() => {
    setDraft(campaignName);
  }, [campaignName]);
  
  const handleBlur = () => {
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
  
  return (
    <div className={s.header}>
      <h1 className="visually-hidden">{campaignName}</h1>

      <div className={s.headerLeft}>
        <input
          id="campaign-name"
          className={s.input}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />
        
        <div className={clsx(s.campaignStatus, {
          [s.underReview]: campaignStatus === "under_review",
          [s.distributing]: campaignStatus === "distributing",
          [s.completed]: campaignStatus === "completed",
          [s.proposal]: campaignStatus === "proposal",
          // [s.pause]: campaignStatus === "pause",
        })}>
          <span>Status: {CAMPAIGN_STATUS_LABELS[campaignStatus]}</span>
        </div>
      </div>

      <div className={s.headerRight}>
        <span className={s.internalCost}>Internal cost: {internalCost}{CURRENCY_LABELS[currency]}</span>

        <button
          className={s.action}
          type="button"
          onClick={onReset}
          disabled={isResetDisabled}
          aria-label="Reset cahnages"
          aria-busy={isResetDisabled}
        >
          Reset
        </button>

        <button
          className={clsx(s.action, s.save)}
          type="button"
          onClick={() => alert("Function don`t implemented yet!")}
          disabled={false}
          aria-label="Save campaign cahnages"
          aria-busy={false}
        >
          Save
        </button>
      </div>

    </div>
  );
};
