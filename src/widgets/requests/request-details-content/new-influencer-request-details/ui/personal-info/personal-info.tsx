import React from "react";
import { PERSONAL_INFO_FIELDS } from "../../model/new-influencer-request-details.config.tsx";
import type { INewInfluencerRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './personal-info.module.scss';

interface PersonalInfoProps {
  data: INewInfluencerRequestDetailsDto;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
  data,
}) => {
  return (
    <ul className={s.root}>
      {PERSONAL_INFO_FIELDS.map(({ key, label }) => (
        <li key={key} className={s.item}>
          <span className={s.label}>{label}</span>
          <span className={s.value}>{data[key] || "N/A"}</span>
        </li>
      ))}
    </ul>
  );
};
