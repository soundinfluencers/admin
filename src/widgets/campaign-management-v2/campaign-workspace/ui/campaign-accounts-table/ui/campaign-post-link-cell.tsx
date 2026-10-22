import { IconButton } from "@/shared/ui/v2/icon-button";
import { ButtonLink } from "@/shared/ui/v2/button-link";
import { EditPostLink } from "@/features/campaign-management/edit-post-link";

import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

import PencilIcon from '@/shared/assets/icons/pencil.svg?react';
import ExternalLinkIcon from '@/shared/assets/icons/external-link.svg?react';

import s from "./campaign-accounts-table.module.scss";

interface CampaignPostLinkCellProps {
  account: Pick<ICampaignDetails["addedAccounts"][number], "addedAccountsId" | "username" | "postLink">;
  editorRevision: number;
  canEditPostDetails: boolean;
  onUpdatePostLink: (addedAccountsId: string, postLink: string) => void;
}

export const CampaignPostLinkCell = ({
  account,
  editorRevision,
  canEditPostDetails,
  onUpdatePostLink,
}: CampaignPostLinkCellProps) => (
  <div className={s.actions}>
    <EditPostLink
      key={editorRevision}
      disabled={!canEditPostDetails}
      username={account.username}
      value={account.postLink ?? ""}
      onApply={(postLink) =>
        onUpdatePostLink(account.addedAccountsId, postLink)
      }
      trigger={
        <IconButton
          icon={PencilIcon}
          disabled={!canEditPostDetails}
          title={account.postLink ? "Edit post link" : "Add post link"}
          aria-label={account.postLink ? "Edit post link" : "Add post link"}
        />
      }
    />

    {account.postLink && (
      <ButtonLink
        href={account.postLink}
        icon={ExternalLinkIcon}
        size="small"
        target="_blank"
        rel="noopener noreferrer"
        title="Open post link in a new tab"
        aria-label={`Open post link for ${account.username}`}
      />
    )}
  </div>
);
