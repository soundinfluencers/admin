import React, { useState } from "react";
import { Button } from "@/shared/ui";
import { DeleteSocialAccount } from "@/features/influencers/delete-social-account";

import s from './account-actions.module.scss';

interface AccountActionsProps {
  mode: "create" | "edit";
  isPending?: boolean;
  isDeletePending?: boolean;
  onHandleDelete?: () => void;
}

export const AccountActions: React.FC<AccountActionsProps> = ({
  mode,
  isPending = false,
  isDeletePending = false,
  onHandleDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={s.accountActions}>
      {mode === "edit" && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="large"
            onClick={() => setIsModalOpen(true)}
          >
            Delete account
          </Button>

          {isModalOpen && (
            <DeleteSocialAccount
              onHandleDelete={onHandleDelete}
              onClose={() => setIsModalOpen(false)}
              isDeletePending={isDeletePending}
            />
          )}
        </>
      )}

      <Button
        type="submit"
        variant="primary"
        size="large"
        disabled={isPending}
      >
        {isPending ?
          "Loading..."
          :
          mode === "create" ? "Add account" : "Save"
        }
      </Button>
    </div>
  );
};
