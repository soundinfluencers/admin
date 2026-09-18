import { useState } from "react";
import { Button, Modal } from "@/shared/ui";
import { useDeleteInfluencerMutation } from "../model/use-delete-influencer-mutation.ts";

import s from './delete-influencer.module.scss';

interface DeleteInfluencerProps {
  influencerId: string;
}

export const DeleteInfluencer = ({ influencerId }: DeleteInfluencerProps) => {
  const { mutate, isPending } = useDeleteInfluencerMutation();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className={s.deleteTrigger}
        size="large"
        variant="primary"
        onClick={() => setIsOpen(true)}
        aria-label="Delete Influencer"
      >
        Delete influencer profile
      </Button>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)} isShownCloseButton>

          <div className={s.content}>
            <div className={s.header}>
              <h2 className={s.title}>Delete influencer profile?</h2>
              <span className={s.subtitle}>
                This will permanently delete this influencer profile.
                <br/>
                This action cannot be undone.
              </span>
            </div>

            <div className={s.cta}>
              <Button
                variant="secondary"
                type="button"
                size="large"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button
                className={s.deleteTrigger}
                variant="primary"
                type="button"
                size="large"
                onClick={() => mutate(influencerId)}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete profile"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
