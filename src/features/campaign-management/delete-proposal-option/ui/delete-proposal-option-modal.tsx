import type { ComponentProps } from "react";

import { Modal } from "@/shared/ui/v2/modal-v2/modal.tsx";
import { Button } from "@/shared/ui/v2/button-v2";

import s from "./delete-proposal-option-modal.module.scss";

interface DeleteProposalOptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOptionIndex: number;
  willDeleteCampaign: boolean;
  onDelete: () => void;
  isPending: boolean;
  onCloseAutoFocus?: ComponentProps<typeof Modal>["onCloseAutoFocus"];
}

export const DeleteProposalOptionModal = ({
  open,
  onOpenChange,
  selectedOptionIndex,
  willDeleteCampaign,
  onDelete,
  isPending,
  onCloseAutoFocus,
}: DeleteProposalOptionModalProps) => (
  <Modal
    open={open}
    title={willDeleteCampaign ? "Delete campaign" : "Delete proposal option"}
    onOpenChange={(next) => { 
      if (!isPending) onOpenChange(next);
    }}
    onCloseAutoFocus={onCloseAutoFocus}
  >
    <div className={s.content}>
      <p className={s.description}>
        {willDeleteCampaign
          ? "This is the only remaining option. Deleting it will permanently delete the entire campaign, including all unsaved changes."
          : `Are you sure you want to permanently delete Option ${selectedOptionIndex + 1}? Its unsaved changes will also be lost.`}
      </p>
      <p className={s.currentOption}>This action cannot be undone.</p>
    </div>

    <div className={s.actions}>
      <Button 
        label="Cancel"
        disabled={isPending}
        onClick={() => onOpenChange(false)}
      />
      
      <Button 
        variant="danger"
        label={willDeleteCampaign ? "Delete campaign" : "Delete"}
        loadingLabel="Deleting…"
        isLoading={isPending}
        disabled={isPending}
        onClick={() => {
          if (!isPending) {
            onDelete();
          }
        }}
      />
    </div>
  </Modal>
);
