import { useState, type ReactElement } from "react";

import { Modal } from "@/shared/ui/v2/modal-v2/modal";
import { ScreenshotEditor } from "./screenshot-editor";

import s from './edit-screenshot.module.scss';

interface EditScreenshotProps {
  value: string;
  disabled?: boolean;
  username: string;
  onApply: (url: string) => void;
  trigger: ReactElement;
}

export const EditScreenshot = ({
  value,
  disabled = false,
  username,
  onApply,
  trigger,
}: EditScreenshotProps) => {
  const [open, setOpen] = useState(false);

  const handleApply = (url: string) => {
    if (disabled) return;
    onApply(url);
    setOpen(false);
  };

  return (
    <Modal
      className={s.modal}
      open={open}
      onOpenChange={setOpen}
      title="Screenshot"
      description={username}
      trigger={trigger}
    >
      {open && (
        <ScreenshotEditor
          disabled={disabled}
          value={value}
          username={username}
          onApply={handleApply}
          onCancel={() => setOpen(false)}
        />
      )}
    </Modal>
  );
};
