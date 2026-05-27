import React from "react";
import { SearchByQuery } from "@/features/search";
import { RequestFilterByStatus } from "@/features/requests/request-filter-by-status";
import { ToggleRequestStatus } from "@/features/requests/toggle-request-status";
import type { TRequestFilterStatus, TRequestLifecycleStatus } from "@/entities/requests/model/requests.types.ts";

import s from './requests-toolbar.module.scss';

interface RequestsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilter: TRequestFilterStatus | null;
  onFilterChange: (value: TRequestFilterStatus) => void;
  status: TRequestLifecycleStatus;
  onChangeStatus: () => void;
}

export const RequestsToolbar: React.FC<RequestsToolbarProps> = ({
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  status,
  onChangeStatus,
}) => {
  return (
    <div className={s.toolbar}>
      <div className={s.search}>
        <SearchByQuery
          value={searchValue}
          onChange={onSearchChange}
          className={s.input}
        />
      </div>

      <div className={s.filters}>
        <RequestFilterByStatus
          value={activeFilter}
          onFilterChange={onFilterChange}
        />
      </div>

      <div className={s.toggle}>
        <ToggleRequestStatus
          mode={status}
          onChangeMode={onChangeStatus}
        />
      </div>
    </div>
  );
};
