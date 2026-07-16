import { Button } from "@/shared/ui";
import { Modal } from "@/shared/ui/modal/modal.tsx";

import s from "./delete-offer-confirmation-modal.module.scss";

interface DeleteOfferConfirmationModalProps {
  offerTitle: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteOfferConfirmationModal = ({
  offerTitle,
  isPending,
  onCancel,
  onConfirm,
}: DeleteOfferConfirmationModalProps) => {
  const handleCancel = () => {
    if (isPending) return;

    onCancel();
  };

  return (
    <Modal onClose={isPending ? undefined : onCancel}>
      <div className={s.head}>
        <h2 className={s.title}>Delete offer?</h2>
        <p className={s.subtitle}>
          Are you sure you want to delete "{offerTitle}"? You won't be able to
          restore this.
        </p>
      </div>

      <div className={s.cta}>
        <Button
          type="button"
          size="large"
          variant="secondary"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancel
        </Button>

        <Button
          type="button"
          size="large"
          variant="primary"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Modal>
  );
};
