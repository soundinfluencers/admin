import React, { useState } from 'react';
import { Modal } from "@/shared/ui/modal/modal.tsx";
import { Button } from "@/shared/ui";
import {
  useDeleteClientMutation
} from "@/features/clients/delete-client-account/model/use-delete-client-account-mutation.ts";

import s from './delete-client-account.module.scss';

interface DeleteClientAccountProps {
  clientId: string;
}

export const DeleteClientAccount: React.FC<DeleteClientAccountProps> = ({
  clientId,
}) => {
  const { mutate, isPending } = useDeleteClientMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={s.deleteButton}
        onClick={() => setIsModalOpen(true)}
        aria-label="Delete client account"
      >
        Delete account
      </button>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className={s.head}>
            <h2 className={s.title}>Are you sure you want to delete this account?</h2>
            <p className={s.subtitle}>You won’t be able to restore this!</p>
          </div>
          <div className={s.cta}>
            <Button
              type="button"
              size='large'
              variant='secondary'
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              size='large'
              variant='primary'
              onClick={() => mutate(clientId)}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};
