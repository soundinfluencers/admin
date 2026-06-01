import React from "react";

import s from "./payment-field.module.scss";

interface PaymentFieldProps {
  label: string;
  value?: string;
}

export const PaymentField: React.FC<PaymentFieldProps> = ({ label, value }) => {
  if (!value) return null;
  return (
    <span className={s.field}>
      {label}: {value}
    </span>
  );
};

