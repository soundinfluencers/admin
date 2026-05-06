import React from "react";
import { SearchByQuery } from "@/features/search";
import { PaymentHistoryStatuses } from "@/widgets/payment-history/payment-history-statuses";

import s from './payment-history-tollbar.module.scss';

interface PaymentHistoryTollbarProps {
  searchValue: string;
  onSearchChange: (searchQuery: string) => void;
}

export const PaymentHistoryTollbar: React.FC<PaymentHistoryTollbarProps> = ({
  searchValue,
  onSearchChange,
}) => {
  return (
    <div className={s.paymentHistoryTollbar}>
      <div className={s.searchWrapper}>
        <SearchByQuery
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>

      <PaymentHistoryStatuses/>
    </div>
  );
};
