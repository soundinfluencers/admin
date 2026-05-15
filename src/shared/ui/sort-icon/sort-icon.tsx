import React from "react";
import clsx from 'clsx';

import s from './sort-icon.module.scss';

interface SortIconProps {
  direction: 'asc' | 'desc' | false;
}

export const SortIcon: React.FC<SortIconProps> = ({
  direction,
}) => {
  return (
    <svg
      className={s.icon}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        className={clsx(
          s.chevron,
          direction === 'asc' && s.active,
        )}
        d="M4 6L8 2L12 6"
      />

      <path
        className={clsx(
          s.chevron,
          direction === 'desc' && s.active,
        )}
        d="M4 10L8 14L12 10"
      />
    </svg>
  );
};
