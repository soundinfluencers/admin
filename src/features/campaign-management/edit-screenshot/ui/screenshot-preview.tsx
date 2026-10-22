import CircleCheckIcon from "@/shared/assets/icons/circle-check.svg?react";
import TrashIcon from "@/shared/assets/icons/trash.svg?react";

import s from './screenshot-preview.module.scss';
import { Button } from "@/shared/ui/v2/button-v2";

interface ScreenshotPreviewProps {
  url: string;
  username: string;
  isRemoveDisabled: boolean;
  onRemoveScreenshot: () => void;
}

export const ScreenshotPreview = ({
  url,
  username,
  isRemoveDisabled,
  onRemoveScreenshot,
}: ScreenshotPreviewProps) => (
  <>
    <div className={s.preview}>
      <img
        src={url}
        className={s.screenshot}
        alt={`Screenshot for ${username}`}
        fetchPriority="high"
      />
    </div>

    <div className={s.availableFileAction}>
      <div className={s.status}>
        <span className={s.statusIcon}>
          <CircleCheckIcon aria-hidden="true" />
        </span>
        <p className={s.statusLabel}>Screenshot available</p>
      </div>

      <Button
        variant="danger"
        label="Remove screenshot"
        icon={TrashIcon}
        disabled={isRemoveDisabled}
        onClick={onRemoveScreenshot}
      />
    </div>
  </>
);
