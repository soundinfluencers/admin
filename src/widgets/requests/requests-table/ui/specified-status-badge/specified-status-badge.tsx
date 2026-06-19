import React from "react";
import clsx from "clsx";
import { REQUEST_SPECIFIED_STATUS } from "@/widgets/requests/model/requests-table.helpers.ts";
import type { TRequestSpecifiedStatus } from "@/entities/requests/model/requests.types.ts";

import s from './specified-status-badge.module.scss';

interface SpecifiedStatusBadgeProps {
  status: TRequestSpecifiedStatus;
}

export const SpecifiedStatusBadge: React.FC<SpecifiedStatusBadgeProps> = ({
  status,
}) => {

  return (
    <div className={clsx(s.badge, {
      [s.pending]: status === "WAITING_FOR_ADMIN",
      [s.approved]: status === "APPROVED",
      [s.rejected]: status === "REJECTED",
      [s.negotiation]: status === "NEGOTIATION",
    })}>
      <span className={s.dot}/>
      <span className={s.label}>{REQUEST_SPECIFIED_STATUS[status]}</span>
    </div>
  );
};
