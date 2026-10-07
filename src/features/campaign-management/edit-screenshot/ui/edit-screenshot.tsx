import { useState, type ReactElement } from "react";

import { Modal } from "@/shared/ui/v2/modal-v2/modal";
import { ScreenshotEditor } from "./screenshot-editor";

import s from './edit-screenshot.module.scss';

interface EditScreenshotProps {
  value: string;
  username: string;
  onApply: (url: string) => void;
  trigger: ReactElement;
}

export const EditScreenshot = ({
  value,
  username,
  onApply,
  trigger,
}: EditScreenshotProps) => {
  const [open, setOpen] = useState(false);

  const handleApply = (url: string) => {
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
          value={value}
          username={username}
          onApply={handleApply}
          onCancel={() => setOpen(false)}
        />
      )}
    </Modal>
  );
};
