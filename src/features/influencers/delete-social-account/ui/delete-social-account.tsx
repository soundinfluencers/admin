import React from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteSocialAccountMutation } from "@/entities/influencers/api/use-delete-social-account-mutation.ts";
import { Modal } from "@/shared/ui/modal/modal.tsx";
import { Button } from "@/shared/ui";
import { toast } from "react-toastify";

import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

import s from './delete-social-account.module.scss';

interface DeleteSocialAccountProps {
  influencerId: string;
  accountId: string;
  socialMedia: TSocialMediaValue;
  onClose: () => void;
}

export const DeleteSocialAccount: React.FC<DeleteSocialAccountProps> = ({
  influencerId,
  accountId,
  socialMedia,
  onClose,
}) => {
  const { mutate, isPending } = useDeleteSocialAccountMutation();
  const navigate = useNavigate();

  const handleDeleteSocialAccount = () => {
    mutate({
      influencerId,
      accountId,
      socialMedia,
    }, {
      onSuccess: () => {
        onClose();
        navigate(`/dashboard/influencers/${influencerId}`);
        toast("Social account deleted successfully!", {
          type: "success",
          position: "top-right",
          autoClose: 3000,
        });
      },
    });
  };

  return (
    <Modal onClose={onClose} isShownCloseButton>

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
            onClick={handleDeleteSocialAccount}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
