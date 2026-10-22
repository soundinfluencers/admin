import { Modal } from "@/shared/ui/v2/modal-v2/modal.tsx";
import { Button } from "@/shared/ui/v2/button-v2";

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
        <Button
          className={s.cancelButton}
          label="Cancel"
          disabled={isPending}
          onClick={() => handleOpenChange(false)}
        />
        
        <Button 
          label="Create empty"
          disabled
          title="Creating an empty option is not available yet"
        />

        <Button
          variant="primary"
          label="Create copy"
          loadingLabel="Creating…"
          isLoading={isPending}
          disabled={isPending || !onCreateCopy}
          onClick={onCreateCopy}
        />
      </div>
    </Modal>
  );
};
