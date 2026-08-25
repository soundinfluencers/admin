import React from "react";
import { PERSONAL_INFO_FIELDS } from "../../model/new-bundle-request-details.config";
import type { INewBundleRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './personal-info.module.scss';

interface PersonalInfoProps {
  data: INewBundleRequestDetailsDto;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
  data,
}) => {
  return (
    <ul className={s.root}>
      {PERSONAL_INFO_FIELDS.map(
        ({ key, label, renderValue }) => {
          const value = renderValue
            ? renderValue(data)
            : data[key];

          const displayedValue =
            value == null || value === ""
              ? "N/A"
              : value;

          return (
            <li key={key} className={s.item}>
              <span className={s.label}>
                {label}
              </span>

              <span className={s.value}>
                {displayedValue}
              </span>
            </li>
          );
        },
      )}
    </ul>
  );
};
