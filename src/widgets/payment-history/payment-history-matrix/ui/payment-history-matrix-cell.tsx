import { memo } from "react";
import type { IPaymentHistoryCell } from "@/entities/payment-history/model/payment-history.types.ts";
import clsx from "clsx";

import s from './payment-history-matrix.module.scss';

interface PaymentHistoryMatrixCellProps {
  cell?: IPaymentHistoryCell;
}

export const PaymentHistoryMatrixCell = memo(({ cell }: PaymentHistoryMatrixCellProps) => {
  return (
    <div className={clsx(
      s.statusCell,
      cell?.effectiveStatus && s[cell.effectiveStatus],
    )}>
      {cell?.label}
    </div>
  );
});
