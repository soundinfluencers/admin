import clsx from "clsx";
import { Spinner } from "@/shared/ui/v2/spinner";

import CircleAlertIcon from "@/shared/assets/icons/circle-alert.svg?react";

import s from './screenshot-status.module.scss';

type ScreenshotStatusProps =
  | { status: "uploading"; fileName: string }
  | { status: "removed" };

export const ScreenshotStatus = (props: ScreenshotStatusProps) => (
  <div
    role="status"
    className={clsx(s.status, props.status === "uploading" ? s.uploadStatus : s.removalStatus)}
  >
    {props.status === "uploading" ? (
      <>
        <span className={s.indicator}>
          <Spinner/>
        </span>

        <div className={s.fileDetails}>
          {props.fileName && <p className={s.fileName}>{props.fileName}</p>}
          <p className={s.uploadMessage}>Uploading screenshot...</p>
        </div>
      </>
    ) : (
      <>
        <CircleAlertIcon aria-hidden="true" />
        <p>Screenshot removed. Apply to confirm.</p>
      </>
    )}
  </div>
);
