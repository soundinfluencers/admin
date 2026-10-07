import { useRef, type ChangeEvent } from "react";
import clsx from "clsx";

import { useScreenshotEditor } from "../model/use-screenshot-editor";

import { ScreenshotSelectionArea } from "./screenshot-selection-area";
import { ScreenshotPreview } from "./screenshot-preview";
import { ScreenshotStatus } from "./screenshot-status";

import s from './screenshot-editor.module.scss';

interface ScreenshotEditorProps {
  value: string;
  username: string;
  onApply: (url: string) => void;
  onCancel: () => void;
}

export const ScreenshotEditor = ({
  value,
  username,
  onApply,
  onCancel,
}: ScreenshotEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    screenshotUrl,
    fileName,
    error,
    isUploading,
    isRemoved,
    canApply,
    canRetry,
    uploadFile,
    retryUpload,
    removeScreenshot,
  } = useScreenshotEditor({ value });

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    
    event.currentTarget.value = "";

    if (!file) return;

    uploadFile(file);
  };

  const handleApply = () => {
    if (!canApply) return;

    onApply(screenshotUrl);
  };

  const selectionState = error ? "error" : isUploading ? "uploading" : "idle";

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        disabled={isUploading}
        onChange={handleFileChange}
      />

      <div className={s.content} aria-busy={isUploading}>
        {screenshotUrl ? (
          <ScreenshotPreview
            url={screenshotUrl}
            username={username}
            isRemoveDisabled={isUploading}
            onRemoveScreenshot={removeScreenshot}
          />
        ) : (
          <ScreenshotSelectionArea
            state={selectionState}
            errorMessage={error}
            canRetry={canRetry}
            onChooseImage={handleChooseImage}
            onRetryUpload={retryUpload}
          />
        )}

        {isUploading && (
          <ScreenshotStatus status="uploading" fileName={fileName} />
        )}

        {isRemoved && !isUploading && !error && (
          <ScreenshotStatus status="removed" />
        )}
      </div>

      <div className={s.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={s.action}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={!canApply}
          onClick={handleApply}
          className={clsx(s.action, s.save)}
        >
          Apply
        </button>
      </div>
    </>
  );
};
