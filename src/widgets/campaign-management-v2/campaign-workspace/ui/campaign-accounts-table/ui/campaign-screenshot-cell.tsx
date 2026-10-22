import { IconButton } from "@/shared/ui/v2/icon-button";
import { ButtonLink } from "@/shared/ui/v2/button-link";
import { EditScreenshot } from "@/features/campaign-management/edit-screenshot";

import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

import PencilIcon from '@/shared/assets/icons/pencil.svg?react';
import ExternalLinkIcon from '@/shared/assets/icons/external-link.svg?react';

import s from "./campaign-accounts-table.module.scss";

interface CampaignScreenshotCellProps {
  account: Pick<ICampaignDetails["addedAccounts"][number], "addedAccountsId" | "username" | "screenshot">;
  editorRevision: number;
  canEditPostDetails: boolean;
  onUpdateScreenshot: (addedAccountsId: string, screenshot: string) => void;
}

export const CampaignScreenshotCell = ({
  account,
  editorRevision,
  canEditPostDetails,
  onUpdateScreenshot,
}: CampaignScreenshotCellProps) => {
  const screenshot = account.screenshot ?? "";

  return (
    <div className={s.actions}>
      <EditScreenshot
        key={editorRevision}
        disabled={!canEditPostDetails}
        value={screenshot}
        username={account.username}
        onApply={(url) =>
          onUpdateScreenshot(account.addedAccountsId, url)
        }
        trigger={
          <IconButton
            icon={PencilIcon}
            disabled={!canEditPostDetails}
            aria-label={`Manage screenshot for ${account.username}`}
          />
        }
      />

      {screenshot && (
        <ButtonLink
          href={screenshot}
          icon={ExternalLinkIcon}
          size="small"
          target="_blank"
          rel="noopener noreferrer"
          title="Open screenshot in a new tab"
          aria-label={`View screenshot for ${account.username}`}
        />
      )}
    </div>
  );
};
