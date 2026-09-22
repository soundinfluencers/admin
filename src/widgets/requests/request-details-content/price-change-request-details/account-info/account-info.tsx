import React from "react";
import { formatCurrency } from "@/shared/libs/format/format-currency.ts";
import { ACCOUNT_INFO_FIELDS } from "../price-change-request-details.config.tsx";
import { SOCIAL_MEDIA_DARK_ICONS, SOCIAL_MEDIA_LABEL_MAP } from "@/widgets/requests/model/social-media.constants.ts";
import type { IPriceUpdateRequestDetailsDto, TRequestType } from "@/entities/requests/model/requests.types.ts";

import s from './account-info.module.scss';

interface AccountInfoProps {
  data: IPriceUpdateRequestDetailsDto;
  requestType: TRequestType;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({
  data,
  requestType,
}) => {
  const renderValue = (key: typeof ACCOUNT_INFO_FIELDS[number]['key']) => {
    if (key === 'currentPrice') {
      return formatCurrency(data.currentPrice, data.currentCurrency);
    }
    if (key === 'newPrice') {
      return formatCurrency(data.newPrice, data.newCurrency);
    }
    return data[key];
  };

  return (
    <div className={s.root}>
      <div className={s.head}>
        <img
          className={s.icon}
          src={SOCIAL_MEDIA_DARK_ICONS[data.socialMedia]}
          alt=""
          width={24}
          height={24}
          aria-hidden
        />
        <h3 className={s.title}>{SOCIAL_MEDIA_LABEL_MAP[data.socialMedia]}</h3>
      </div>

      <ul className={s.fields}>
        {ACCOUNT_INFO_FIELDS.map((field) => {
          const value = renderValue(field.key);

          return (
            <li key={field.key} className={s.field}>
              <span className={s.label}>{field.label}</span>
              {field.render ? field.render(data, requestType) : value}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// <span className={s.value}>{renderValue(key)}</span>
