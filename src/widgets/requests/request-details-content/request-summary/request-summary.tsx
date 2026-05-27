import React from "react";
import { REQUEST_SUMMARY_FIELDS } from "../request-summary/request-summary.config.ts";
import { REQUEST_GROUP, REQUEST_TYPE } from "@/widgets/requests/model/requests-table.helpers.ts";
import type { TAdminRequestDetails } from "@/entities/requests/model/requests.types.ts";

import s from './request-summary.module.scss';

interface RequestSummaryProps {
 data: TAdminRequestDetails;
}

export const RequestSummary: React.FC<RequestSummaryProps> = ({
  data,
}) => {

  return (
    <div className={s.root}>
      <h2 className={s.title}>Review Request</h2>
      <div className={s.info}>
        {REQUEST_SUMMARY_FIELDS.map(({ key, label }) => (
          <div key={key} className={s.infoItem}>
            <span className={s.infoLabel}>{label}</span>
            <span className={s.infoValue}>
              {key === 'type' && REQUEST_TYPE[data[key]]}
              {key === 'group' && REQUEST_GROUP[data[key]]}
              {key !== 'type' && key !== 'group' && data[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
