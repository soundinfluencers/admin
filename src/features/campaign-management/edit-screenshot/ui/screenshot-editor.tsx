import { useRef, type ChangeEvent } from "react";

import { Button } from "@/shared/ui/v2/button-v2";
import { useScreenshotEditor } from "../model/use-screenshot-editor";

import { ScreenshotSelectionArea } from "./screenshot-selection-area";
import { ScreenshotPreview } from "./screenshot-preview";
import { ScreenshotStatus } from "./screenshot-status";

import s from './screenshot-editor.module.scss';

interface ScreenshotEditorProps {
  value: string;
  disabled?: boolean;
  username: string;
  onApply: (url: string) => void;
  onCancel: () => void;
}

export const ScreenshotEditor = ({
  value,
  disabled = false,
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
    if (!disabled) fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    
    event.currentTarget.value = "";

    if (!file || disabled) return;

    uploadFile(file);
  };

  const handleApply = () => {
    if (disabled || !canApply) return;

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
        disabled={disabled || isUploading}
        onChange={handleFileChange}
      />

      <div className={s.content} aria-busy={isUploading}>
        {screenshotUrl ? (
          <ScreenshotPreview
            url={screenshotUrl}
            username={username}
            isRemoveDisabled={disabled || isUploading}
            onRemoveScreenshot={() => { if (!disabled) removeScreenshot(); }}
          />
        ) : (
          <ScreenshotSelectionArea
            disabled={disabled}
            state={selectionState}
            errorMessage={error}
            canRetry={canRetry}
            onChooseImage={handleChooseImage}
            onRetryUpload={() => { 
              if (!disabled) retryUpload(); 
            }}
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
        <Button 
          label="Cancel"
          onClick={onCancel}
          disabled={isUploading}
        />
        
        <Button 
          variant="primary"
          label="Apply"
          disabled={disabled || !canApply}
          onClick={handleApply}
        />
      </div>
    </>
  );
};
