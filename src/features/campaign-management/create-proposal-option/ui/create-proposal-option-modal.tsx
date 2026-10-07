import clsx from "clsx";
import { Modal } from "@/shared/ui/v2/modal-v2/modal.tsx";

import CircleLoaderIcon from "@/shared/assets/icons/loader-circle.svg?react";

import s from "./create-proposal-option-modal.module.scss";

interface CreateProposalOptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOptionIndex: number;
  onCreateCopy?: () => void;
  isPending?: boolean;
}

export const CreateProposalOptionModal = ({
  open,
  onOpenChange,
  selectedOptionIndex,
  onCreateCopy,
  isPending = false,
}: CreateProposalOptionModalProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending && !nextOpen) return;

    onOpenChange(nextOpen);
  };

  return (
    <Modal
      className={s.modal}
      open={open}
      onOpenChange={handleOpenChange}
      title="Create proposal option"
    >
      <div className={s.content}>
        <p className={s.description}>
          Would you like to create an empty option or copy the current option?
        </p>
        <p className={s.currentOption}>
          Current option: Option {selectedOptionIndex + 1}
        </p>
      </div>

      <div className={s.actions}>
        <button
          type="button"
          className={s.action}
          disabled
          title="Creating an empty option is not available yet"
        >
          Create empty
        </button>

        <button
          type="button"
          className={clsx(s.action, s.copy)}
          disabled={isPending || !onCreateCopy}
          onClick={onCreateCopy}
          aria-busy={isPending}
        >
          {isPending ? (
            <>
              <span
               className={s.indicator}
               role="status"
               aria-label="Creating proposal option"
              >
                <CircleLoaderIcon
                  className={s.loader}
                  aria-hidden="true"
                  focusable="false"
                />
              </span>
              {"Creating…"}
            </>
          ) : "Create copy"}
        </button>
      </div>
    </Modal>
  );
};
