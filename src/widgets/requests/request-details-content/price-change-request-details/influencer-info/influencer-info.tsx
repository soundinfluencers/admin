import React from "react";
import { INFLUENCER_PERSONAL_INFO_FIELDS } from "../price-change-request-details.config.ts";
import type { IPriceUpdateRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './influencer-info.module.scss';

interface InfluencerInfoProps {
  data: IPriceUpdateRequestDetailsDto;
}

export const InfluencerInfo: React.FC<InfluencerInfoProps> = ({
  data,
}) => {
  return (
    <ul className={s.root}>
      {INFLUENCER_PERSONAL_INFO_FIELDS.map(({ key, label }) => (
        <li key={key} className={s.item}>
          <span className={s.label}>{label}</span>
          <span className={s.value}>{data[key] || "N/A"}</span>
        </li>
      ))}
    </ul>
  );
};
