import React from "react";
import clsx from "clsx";
import type { TViewCampaignMode } from "@/entities/campaign";

import repeat from '@/assets/icons/campaigns/icons/repeat.svg';

import styles from './open-campaign-payments.module.scss';

interface OpenCampaignPaymentsProps {
  campaignMode: TViewCampaignMode;
  onToggle: () => void;
}

export const OpenCampaignPayments: React.FC<OpenCampaignPaymentsProps> = ({ campaignMode, onToggle }) => {
  return (
    <button
      className={clsx(styles.button, {
        [styles['button--active']]: campaignMode === 'affiliate',
      })}
      onClick={onToggle}
    >
      <img
        src={repeat}
        alt="Open Campaign Payments"
        className={styles.icon}
        width={18}
        height={18}
      />
      {campaignMode === 'affiliate' ? 'See payments & report status' : 'See campaigns affiliate'}
    </button>
  );
};
