import ImageUpIcon from "@/shared/assets/icons/image-up.svg?react";
import ImageOff from "@/shared/assets/icons/image-off.svg?react";
import RefreshIcon from "@/shared/assets/icons/refresh.svg?react";

import s from './screenshot-selection-area.module.scss';

interface ScreenshotSelectionAreaProps {
  state: "idle" | "uploading" | "error";
  errorMessage: string | null;
  canRetry: boolean;
  onChooseImage: () => void;
  onRetryUpload: () => void;
}

export const ScreenshotSelectionArea = ({
  state,
  errorMessage,
  canRetry,
  onChooseImage,
  onRetryUpload,
}: ScreenshotSelectionAreaProps) => (
  <div
    role={state === "error" ? "alert" : undefined}
    className={s.selectionArea}
    data-state={state}
  >
    <span className={s.iconContainer}>
      {state === "error" ? (
        <ImageOff aria-hidden="true" className={s.icon} />
      ) : (
        <ImageUpIcon aria-hidden="true" className={s.icon} />
      )}
    </span>

    <div className={s.text}>
      {state === "error" ? (
        <p className={s.errorMessage}>{errorMessage}</p>
      ) : (
        <>
          <p className={s.mainText}>Upload screenshot</p>
          <p className={s.supportingText}>Choose an image from your device</p>
        </>
      )}
    </div>

    <div className={s.retryActions}>
      {state === "error" && canRetry && (
        <button
          className={s.chooseButton}
          type="button"
          onClick={onRetryUpload}
        >
          <RefreshIcon aria-hidden="true" />
          Retry upload
        </button>
      )}

      <button
        type="button"
        className={s.chooseButton}
        disabled={state === "uploading"}
        onClick={onChooseImage}
      >
        Choose image
      </button>
    </div>
  </div>
);
