import React from "react";
import { PERSONAL_INFO_FIELDS, PAYMENT_METHODS_LABEL } from "../campaign-request-details.config.ts";
import { formatCurrency } from "@/shared/libs/format/format-currency.ts";
import type { ICampaignRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './personal-info.module.scss';

interface PersonalInfoProps {
  data: ICampaignRequestDetailsDto;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
  data,
}) => {
  return (
    <ul className={s.root}>
      {PERSONAL_INFO_FIELDS.map(({ key, label }) => (
        <li key={key} className={s.item}>
          <span className={s.label}>{label}</span>
          {key === 'paymentMethod' && (
            <span className={s.value}>{PAYMENT_METHODS_LABEL[data[key]]}</span>
          )}
          {key !== 'paymentMethod' && key !== "price" && (
            <span className={s.value}>{data[key]}</span>
          )}
          {key === "price" && (
            <span className={s.value}>{formatCurrency(data.price, data.displayCurrency)}</span>
          )}
        </li>
      ))}
    </ul>
  );
};
