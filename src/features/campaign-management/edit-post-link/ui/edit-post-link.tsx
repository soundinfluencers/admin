import { useState, type ReactElement } from "react";

import { Modal } from "@/shared/ui/v2/modal-v2/modal";
import { EditPostLinkForm } from "./edit-post-link-form";

import s from './edit-post-link.module.scss';

interface EditPostLinkProps {
  value: string;
  disabled?: boolean;
  username: string;
  onApply: (value: string) => void;
  trigger: ReactElement;
}

export const EditPostLink = ({
  value,
  disabled = false,
  username,
  onApply,
  trigger,
}: EditPostLinkProps) => {
  const [open, setOpen] = useState(false);

  const handleApply = (nextValue: string) => {
    
    if (disabled) return;
    onApply(nextValue);
    setOpen(false);
  };

  return (
    <Modal
      className={s.modal}
      open={open}
      onOpenChange={setOpen}
      title={value ? "Edit post link" : "Add post link"}
      description={username}
      trigger={trigger}
    >
      <EditPostLinkForm
        disabled={disabled}
        value={value}
        onApply={handleApply}
        onCancel={() => setOpen(false)}
      />
    </Modal>
  );
};
