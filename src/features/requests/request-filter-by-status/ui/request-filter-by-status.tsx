import React from "react";
import clsx from "clsx";
import { REQUEST_FILTER_OPTIONS } from "../model/request-filter-by-status.config.ts";
import type { TRequestFilterStatus } from "@/entities/requests/model/requests.types.ts";

import s from './request-filter-by-status.module.scss';

interface RequestFilterByStatusProps {
  value: TRequestFilterStatus | null;
  onFilterChange: (value: TRequestFilterStatus) => void;
}

export const RequestFilterByStatus: React.FC<RequestFilterByStatusProps> = ({
  value,
  onFilterChange,
}) => {
  return (
    <ul className={s.root}>
      {REQUEST_FILTER_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <li key={option.value} className={s.item}>
            <button
              type="button"
              className={clsx(s.filter, {
                [s.active]: isSelected,
              })}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
              <span className={clsx(s.indicator, {
                [s.active]: isSelected,
              })}/>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
