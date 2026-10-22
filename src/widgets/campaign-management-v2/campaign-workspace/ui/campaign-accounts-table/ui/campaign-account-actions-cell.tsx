import { IconButton } from "@/shared/ui/v2/icon-button";

import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

import TrashIcon from "@/shared/assets/icons/trash.svg?react";
import MailIcon from "@/shared/assets/icons/mail.svg?react";

import s from "./campaign-accounts-table.module.scss";

interface CampaignAccountActionsCellProps {
  account: Pick<ICampaignDetails["addedAccounts"][number], "addedAccountsId" | "influencerId" | "username">;
  canSendMessage: boolean;
  isMessageActionDisabled: boolean;
  canRemoveAccount: boolean;
  onOpenMessagePreview: (influencerId: string, trigger: HTMLButtonElement) => void;
  onAccountRemove: (addedAccountsId: string) => void;
}

export const CampaignAccountActionsCell = ({
  account,
  canSendMessage,
  isMessageActionDisabled,
  canRemoveAccount,
  onOpenMessagePreview,
  onAccountRemove,
}: CampaignAccountActionsCellProps) => (
  <div className={s.actions}>
    {canSendMessage && (
      <IconButton
        icon={MailIcon}
        disabled={isMessageActionDisabled}
        aria-label={`Preview message for ${account.username}`}
        title="Preview message"
        onClick={(event) => {
          if (isMessageActionDisabled) return;

          onOpenMessagePreview(
            account.influencerId,
            event.currentTarget,
          );
        }}
      />
    )}

    <IconButton
      variant="danger"
      icon={TrashIcon}
      disabled={!canRemoveAccount}
      aria-label={`Remove account ${account.username}`}
      title="Remove account"
      onClick={() => {
        if (!canRemoveAccount) return;

        onAccountRemove(account.addedAccountsId);
      }}
    />
  </div>
);
