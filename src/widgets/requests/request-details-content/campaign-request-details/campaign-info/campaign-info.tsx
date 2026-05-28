import React from "react";
import clsx from "clsx";

import { CAMPAIGN_INFO_FIELDS } from "../campaign-request-details.config.ts";
import { SOCIAL_MEDIA_DARK_ICONS } from "@/widgets/requests/model/social-media.constants.ts";
import type { ICampaignItem } from "@/entities/requests/model/requests.types.ts";
import { renderValue } from "./render-value.tsx";

import s from './campaign-info.module.scss';

interface CampaignInfoProps {
  item: ICampaignItem;
}

export const CampaignInfo: React.FC<CampaignInfoProps> = ({
  item,
}) => {
  return (
    <div className={s.root}>
      <div className={s.head}>
        <img
          className={s.icon}
          src={SOCIAL_MEDIA_DARK_ICONS[item.socialMedia]}
          alt=""
          width={24}
          height={24}
          aria-hidden
        />
        {/* TODO: replace with actual campaign name from item when available */}
        <h3 className={s.title}>N/A</h3>
      </div>

      <ul className={s.fields}>
        {CAMPAIGN_INFO_FIELDS.map(({ key, label }) => {
          const isMultiDescription = key === 'descriptions' && item.descriptions.length > 1;

          return (
            <li key={key} className={clsx(s.field, (key === 'accounts' || isMultiDescription) && s.field_top)}>
              <span className={s.label}>{label}</span>
              <span className={clsx(s.value, key === 'descriptions' && s.value_column)}>
                {renderValue(key, item)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
