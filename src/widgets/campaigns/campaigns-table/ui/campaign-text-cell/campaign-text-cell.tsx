import React from "react";
import clsx from "clsx";

import s from './campaign-text-cell.module.scss';

interface CampaignTextCellProps {
  value: string | number;
  isAdmin?: boolean;
  className?: string;
}

export const CampaignTextCell: React.FC<CampaignTextCellProps> = ({ value, isAdmin ,className = "" }) => {
  const displayValue = value ? value : "—";

  return (
    <div
      className={className}
      title={String(value || "—")}
    >
      <span className={clsx(s.text, {
        [s.placeholder]: isAdmin,
      })}
      >
        {displayValue}
      </span>
    </div>
  );
};
