import clsx from "clsx";

import CircleLoaderIcon from "@/shared/assets/icons/loader-circle.svg?react";
import CircleCheckIcon from "@/shared/assets/icons/circle-check.svg?react";

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
          <CircleLoaderIcon className={s.loader} aria-hidden="true" focusable="false" />
        </span>

        <div className={s.fileDetails}>
          {props.fileName && <p className={s.fileName}>{props.fileName}</p>}
          <p className={s.uploadMessage}>Uploading screenshot...</p>
        </div>
      </>
    ) : (
      <>
        <CircleCheckIcon aria-hidden="true" />
        <p>Screenshot removed. Apply to confirm.</p>
      </>
    )}
  </div>
);
