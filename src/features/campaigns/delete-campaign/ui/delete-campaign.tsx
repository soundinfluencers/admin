import React from "react";
import { useDeleteCampaignMutation } from "@/entities/campaign/api/use-delete-campaign-mutation.ts";
import { Button } from "@/shared/ui";
import { Modal } from "@/shared/ui/modal/modal.tsx";
import { toast } from "react-toastify";
import type { TCampaignStatus } from "@/entities/campaign";

import s from './delete-campaign.module.scss';

interface DeleteCampaignProps {
  campaignId: string;
  status: TCampaignStatus;
  onClose: () => void;
}

export const DeleteCampaign: React.FC<DeleteCampaignProps> = ({ campaignId, status, onClose }) => {
  const { mutate, isPending } = useDeleteCampaignMutation();

  const handleDelete = () => {
    mutate({
        campaignId,
        status,
      },
      {
        onSuccess: () => {
          toast(`Campaign with ID: ${campaignId} was successfully deleted!`,
            { type: "success", position: "bottom-center", autoClose: 3000 });

          onClose();
        },
      })
  }

  return (
    <Modal onClose={onClose}>

      <div className={s.header}>
        <h3 className={s.title}>Are you sure you want to delete this campaign?</h3>
        <p className={s.description}>You won’t be able to restore this!</p>
      </div>

      <div className={s.cta}>
        <Button
          className={s.btn}
          variant="secondary"
          size={"large"}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          className={s.btn}
          variant="primary"
          size={"large"}
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

    </Modal>
  );
};
