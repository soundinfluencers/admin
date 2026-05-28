import React from "react";

import { SOCIAL_MEDIA_LABEL_MAP } from "@/widgets/requests/model/social-media.constants.ts";
import type { ICampaignItem } from "@/entities/requests/model/requests.types.ts";

import s from './campaign-info.module.scss';

export const renderValue = (key: keyof ICampaignItem, item: ICampaignItem): React.ReactNode => {
  if (key === 'socialMedia') return <span>{SOCIAL_MEDIA_LABEL_MAP[item[key]]}</span>;
  if (key === 'accounts') return item[key].map(a => <span key={a} className={s.account}>{a}</span>);
  if (key === 'descriptions') return item[key].map((d, i) => <span key={i} className={s.description}>{i + 1}. {d}</span>);
  return <span>{item[key] || 'N/A'}</span>;
};

