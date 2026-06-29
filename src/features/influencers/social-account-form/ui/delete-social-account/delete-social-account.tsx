import React from "react";
import { Modal } from "@/shared/ui/modal/modal.tsx";
import { Button } from "@/shared/ui";

import s from './delete-social-account.module.scss';

interface DeleteSocialAccountProps {
  onClose: () => void;
  isDeletePending?: boolean;
  onHandleDelete?: () => void;
}

export const DeleteSocialAccount: React.FC<DeleteSocialAccountProps> = ({
  onClose,
  isDeletePending,
  onHandleDelete,
}) => {
  return (
    <Modal
      onClose={onClose}
      isShownCloseButton
    >

      <div className={s.content}>
        <div className={s.header}>
          <h2 className={s.title}>Delete Account</h2>
          <span className={s.subtitle}>Are you sure you want to delete this account?</span>
        </div>

        <div className={s.cta}>
          <Button
            variant="secondary"
            type="button"
            size="large"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            type="button"
            size="large"
            onClick={onHandleDelete}
            disabled={isDeletePending}
          >
            {isDeletePending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
