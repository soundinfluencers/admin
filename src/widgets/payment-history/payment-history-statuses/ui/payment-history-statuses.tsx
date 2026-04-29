import {
  PAYMENT_HISTORY_STATUSES
} from "@/widgets/payment-history/payment-history-statuses/model/payment-history-statuses.constants.ts";

import s from './payment-history-statuses.module.scss';

export const PaymentHistoryStatuses = () => {
  return (
    <ul className={s.paymentHistoryStatuses}>
      {PAYMENT_HISTORY_STATUSES.map((status) => (
        <li
          key={status.value}
          className={s.statusItem}
        >
          <span
            className={s.statusColor}
            style={{ backgroundColor: status.color }}
          />

          <span className={s.statusLabel}>{status.label}</span
        >
        </li>
      ))}
    </ul>
  );
};
