import ImageUpIcon from "@/shared/assets/icons/image-up.svg?react";
import ImageOff from "@/shared/assets/icons/image-off.svg?react";
import RefreshIcon from "@/shared/assets/icons/refresh.svg?react";

import s from './screenshot-selection-area.module.scss';
import { Button } from "@/shared/ui/v2/button-v2";

interface ScreenshotSelectionAreaProps {
  disabled?: boolean;
  state: "idle" | "uploading" | "error";
  errorMessage: string | null;
  canRetry: boolean;
  onChooseImage: () => void;
  onRetryUpload: () => void;
}

export const ScreenshotSelectionArea = ({
  state,
  disabled = false,
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
        <ImageOff aria-hidden="true" className={s.icon}/>
      ) : (
        <ImageUpIcon aria-hidden="true" className={s.icon}/>
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
        <Button
          label="Retry upload"
          icon={RefreshIcon}
          disabled={disabled}
          onClick={onRetryUpload}
        />
      )}

      <Button
        label="Choose image"
        disabled={disabled || state === "uploading"}
        onClick={onChooseImage}
      />
    </div>
  </div>
);
