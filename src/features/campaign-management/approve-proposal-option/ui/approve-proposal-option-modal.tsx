import type { ComponentProps } from "react";

import { Modal } from "@/shared/ui/v2/modal-v2/modal";
import { Button } from "@/shared/ui/v2/button-v2";

import s from "./approve-proposal-option-modal.module.scss";

interface ApproveProposalOptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOptionIndex: number;
  onApprove: () => void;
  isPending?: boolean;
  onCloseAutoFocus?: ComponentProps<typeof Modal>["onCloseAutoFocus"];
}

export const ApproveProposalOptionModal = ({
  open,
  onOpenChange,
  selectedOptionIndex,
  onApprove,
  isPending = false,
  onCloseAutoFocus,
}: ApproveProposalOptionModalProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending && !nextOpen) return;

    onOpenChange(nextOpen);
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Approve proposal option"
      onCloseAutoFocus={onCloseAutoFocus}
    >
      <div className={s.content}>
        <p className={s.description}>
          Approve this proposal option and move the campaign to Under Review?
        </p>

        <p className={s.currentOption}>
          Current option: Option {selectedOptionIndex + 1}
        </p>
      </div>

      <div className={s.actions}>
        <Button 
          label="Cancel"
          disabled={isPending}
          onClick={() => handleOpenChange(false)}
        />
        
        <Button
          variant="primary"
          label="Approve"
          loadingLabel="Approving…"
          isLoading={isPending}
          disabled={isPending}
          onClick={onApprove}
        />
      </div>
    </Modal>
  );
};
