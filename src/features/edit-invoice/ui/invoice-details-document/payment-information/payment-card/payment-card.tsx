import React from "react";

import s from './payment-card.module.scss';

interface PaymentCardProps {
  title: string;
  fields: {
    label: string;
    value: string;
  }[];
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  title,
  fields,
}) => {
  return (
    <div className={s.card}>
      <span className={s.title}>{title}</span>
      <div className={s.info}>
        {fields.map((field) => (
          <div className={s.value} key={field.value}>
            <span className={s.label}>{field.label}</span>
            <span className={s.text}>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
