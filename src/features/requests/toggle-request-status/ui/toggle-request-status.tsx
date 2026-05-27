import React from "react";
import clsx from "clsx";
import type { TRequestLifecycleStatus } from "@/entities/requests/model/requests.types.ts";

import s from './toggle-request-status.module.scss';

interface ToggleRequestStatusProps {
  mode: TRequestLifecycleStatus;
  onChangeMode: () => void;
}

export const ToggleRequestStatus: React.FC<ToggleRequestStatusProps> = ({
  mode,
  onChangeMode,
}) => {
  return (
    <button
      type="button"
      className={clsx(s.toggleButton, {
        [s.active]: mode === 'CLOSED',
      })}
      onClick={onChangeMode}
      aria-label="Toggle Request Lifecycle Status"
    >
      {mode === 'OPEN' ? "Past requests" : "Open requests"}
    </button>
  );
};


