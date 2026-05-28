import React from "react";
import { CAMPAIGN_INFO_FIELDS } from "../bespoke-campaign-request-details.config.ts";
import type { IBespokeCampaignRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './bespoke-campaign-info.module.scss';

interface BespokeCampaignInfoProps {
  data: IBespokeCampaignRequestDetailsDto;
}

export const BespokeCampaignInfo: React.FC<BespokeCampaignInfoProps> = ({
  data,
}) => {
  return (
    <ul className={s.root}>
      {CAMPAIGN_INFO_FIELDS.map(({ key, label }) => (
        <li key={key} className={s.item}>
          <span className={s.label}>{label}</span>
          <span className={s.value}>{data[key] ?? "N/A"}</span>
        </li>
      ))}
    </ul>
  );
};
