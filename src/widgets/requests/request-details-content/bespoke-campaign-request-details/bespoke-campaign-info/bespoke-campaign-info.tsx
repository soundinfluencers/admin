import React from "react";
import {
  BESPOKE_CAMPAIGN_CATEGORY_LABEL,
  CAMPAIGN_INFO_FIELDS,
  type TCampaignInfoFieldKey,
} from "../bespoke-campaign-request-details.config.ts";
import type { IBespokeCampaignRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './bespoke-campaign-info.module.scss';

interface BespokeCampaignInfoProps {
  data: IBespokeCampaignRequestDetailsDto;
}

export const BespokeCampaignInfo: React.FC<BespokeCampaignInfoProps> = ({
  data,
}) => {
  const category = data.category;
  const currency = data.currency ?? "\u20AC";

  const getFieldValue = (key: TCampaignInfoFieldKey) => {
    switch (key) {
      case "category":
        return BESPOKE_CAMPAIGN_CATEGORY_LABEL[category] ?? "N/A";

      case "budget":
        return data.budget ? `${data.budget}${currency}` : "N/A";

      default:
        return data[key] ?? "N/A";
    }
  }

  return (
    <ul className={s.root}>
      {CAMPAIGN_INFO_FIELDS[category].map(({ key, label }) => (
        <li key={key} className={s.item}>
          <span className={s.label}>{label}</span>
          <span className={s.value}>{getFieldValue(key)}</span>
        </li>
      ))}
    </ul>
  );
};
