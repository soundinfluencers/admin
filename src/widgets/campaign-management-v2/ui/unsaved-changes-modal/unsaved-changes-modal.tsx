import type { ComponentProps } from "react";
import clsx from "clsx";
import { Modal } from "@/shared/ui/v2/modal-v2/modal.tsx";

import CircleLoaderIcon from "@/shared/assets/icons/loader-circle.svg?react";

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
        <button
          type="button"
          className={clsx(s.button, s.cancel)}
          disabled={isSaving}
          onClick={() => handleOpenChange(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          className={clsx(s.button, s.discard)}
          disabled={isSaving}
          onClick={onDiscard}
        >
          Discard and continue
        </button>

        <button
          type="button"
          className={clsx(s.button, s.save)}
          disabled={isSaving}
          aria-busy={isSaving}
          onClick={onSave}
        >
          {isSaving ? (
            <>
                 <span
                   className={s.indicator}
                   role="status"
                   aria-label="Save campaign"
                 >
                    <CircleLoaderIcon
                      className={s.loader}
                      aria-hidden="true"
                      focusable="false"
                    />
                  </span>
              {"Saving…"}
            </>
          ) : "Save and continue"}
        </button>
      </div>
    </Modal>
  );
};
