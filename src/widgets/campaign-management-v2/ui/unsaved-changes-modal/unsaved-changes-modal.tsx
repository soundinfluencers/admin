import type { ComponentProps } from "react";
import { Modal } from "@/shared/ui/v2/modal-v2/modal.tsx";
import { Button } from "@/shared/ui/v2/button-v2";

import s from "./unsaved-changes-modal.module.scss";

interface UnsavedChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
  layer?: ComponentProps<typeof Modal>["layer"];
  onCloseAutoFocus?: ComponentProps<typeof Modal>["onCloseAutoFocus"];
  description?: string;
}

export const UnsavedChangesModal = ({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  isSaving = false,
  layer,
  onCloseAutoFocus,
  description = "You have unsaved changes. Save or discard them before continuing.",
}: UnsavedChangesModalProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving && !nextOpen) return;

    onOpenChange(nextOpen);
  };

  return (
    <Modal
      className={s.modal}
      open={open}
      onOpenChange={handleOpenChange}
      title="Unsaved changes"
      layer={layer}
      onCloseAutoFocus={onCloseAutoFocus}
    >
      <p className={s.description}>
        {description}
      </p>

      <div className={s.actions}>
        <Button
          className={s.cancel}
          label="Cancel"
          disabled={isSaving}
          onClick={() => handleOpenChange(false)}
        />
        
        <Button
          variant="danger"
          label="Discard and continue"
          disabled={isSaving}
          onClick={onDiscard}
        />
        
        <Button
          variant="primary"
          label="Save and continue"
          loadingLabel="Saving…"
          isLoading={isSaving}
          disabled={isSaving}
          onClick={onSave}
        />
      </div>
    </Modal>
  );
};
