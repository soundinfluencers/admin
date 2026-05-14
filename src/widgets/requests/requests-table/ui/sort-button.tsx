import React from "react";

import s from './requests-table.module.scss';
import { SortIcon } from "@/shared/ui/sort-icon";

interface SortButtonProps {
  onToggleSorting: () => void;
  isSorted: 'asc' | 'desc' | false;
}

export const SortButton: React.FC<SortButtonProps> = ({
  onToggleSorting,
  isSorted,
}) => {
  return (
    <button
      type="button"
      className={s.sortButton}
      onClick={onToggleSorting}
      aria-label="sort button"
    >
      Type
      <SortIcon direction={isSorted}/>
    </button>
  );
};
