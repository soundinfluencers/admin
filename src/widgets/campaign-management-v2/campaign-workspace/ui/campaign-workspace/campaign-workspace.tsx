import { useState } from "react";
import { CampaignAccountsList } from "../campaign-accounts-list/campaign-accounts-list.tsx";
import { CampaignAccountHeader } from "../campaign-account-header/campaign-account-header.tsx";
import { CampaignAccountEditor } from "../campaign-account-editor/campaign-account-editor.tsx";
import { CampaignAccountAudience } from "../campaign-account-audience/campaign-account-audience.tsx";
import { CampaignAccountsTable } from "../campaign-accounts-table/ui/campaign-accounts-table.tsx";

import type { TCampaignView } from "@/shared/constants/campaign-view.ts";
import type {
  ICampaignDetails,
  IMarkPromoPaidResponse,
  TEditableField,
} from "@/entities/campaign/model/campaign-details.types.ts";

import s from './campaign-workspace.module.scss';

interface CampaignWorkspaceProps {
  campaign: ICampaignDetails;
  view: TCampaignView;
  editorRevision: number;
  canEditMetrics: boolean;
  canMarkAsPaid: boolean;
  canEditPostDetails: boolean;
  readOnly: boolean;
  onAccountContentChange: (addedAccountsId: string, campaignContentItemId: string) => void;
  onCreateContentForAccount: (addedAccountsId: string, mainLink: string) => void;
  onAccountDescriptionChange: (addedAccountsId: string, descriptionId: string) => void;
  onAccountBriefChange: (addedAccountsId: string, additionalBriefId: string) => void;
  onCreateBriefForAccount: (addedAccountsId: string, text: string) => void;
  onCreateDescriptionForAccount: (addedAccountsId: string, text: string) => void;
  onUpdateDescriptionForAccount: (campaignContentItemId: string, descriptionId: string, text: string) => void;
  onUpdateBriefForAccount: (campaignContentItemId: string, additionalBriefId: string, text: string) => void;
  onDeleteContentDescription: (campaignContentItemId: string, descriptionId: string) => void;
  onDeleteContentBrief: (campaignContentItemId: string, additionalBriefId: string) => void;
  onUpdateContentTaggedLink: (campaignContentItemId: string, taggedUser: string) => void;
  onUpdateContentTaggedUser: (campaignContentItemId: string, taggedLink: string) => void;
  onUpdatePostLink: (addedAccountsId: string, postLink: string) => void;
  onUpdateScreenshot: (addedAccountsId: string, screenshot: string) => void;
  onUpdateAccountMetricField: (addedAccountsId: string, field: TEditableField, value: number) => void;
  onPromoPaid: (result: IMarkPromoPaidResponse["data"]) => void | Promise<void>;
  onAccountDateRequestChange: (addedAccountsId: string, dateRequest: string) => void;
  onDeleteCampaignContent: (campaignContentItemId: string) => void;
  onAccountRemove: (addedAccountsId: string) => void;
  canSendMessage: boolean;
  isMessageActionDisabled: boolean;
  onOpenMessagePreview: (influencerId: string, trigger: HTMLButtonElement) => void;
}

export const CampaignWorkspace = ({
  campaign,
  view,
  editorRevision,
  canEditMetrics,
  canMarkAsPaid,
  canEditPostDetails,
  readOnly,
  onAccountContentChange,
  onCreateContentForAccount,
  onAccountDescriptionChange,
  onAccountBriefChange,
  onCreateBriefForAccount,
  onCreateDescriptionForAccount,
  onUpdateDescriptionForAccount,
  onUpdateBriefForAccount,
  onUpdateContentTaggedLink,
  onUpdateContentTaggedUser,
  onUpdatePostLink,
  onUpdateScreenshot,
  onUpdateAccountMetricField,
  onPromoPaid,
  onAccountDateRequestChange,
  onDeleteContentDescription,
  onDeleteContentBrief,
  onDeleteCampaignContent,
  onAccountRemove,
  canSendMessage,
  isMessageActionDisabled,
  onOpenMessagePreview,
}: CampaignWorkspaceProps) => {
  const [selectedAddedAccountsId, setSelectedAddedAccountsId] = useState<string | null>(null);
  
  const accounts = campaign.addedAccounts;
  
  const selectedAccount = accounts.find(
    (account) => account.addedAccountsId === selectedAddedAccountsId,
  ) ?? 
    accounts[0] ?? 
    null;

  if (view === "insights") {
    return (
      <CampaignAccountsTable
        canRemoveAccount={!readOnly}
        campaignId={campaign.campaignId}
        accounts={campaign.addedAccounts}
        canEditMetrics={canEditMetrics}
        canMarkAsPaid={canMarkAsPaid}
        canEditPostDetails={canEditPostDetails}
        onUpdatePostLink={onUpdatePostLink}
        onUpdateScreenshot={onUpdateScreenshot}
        onUpdateAccountMetricField={onUpdateAccountMetricField}
        onPromoPaid={onPromoPaid}
        onAccountRemove={onAccountRemove}
        canSendMessage={canSendMessage}
        isMessageActionDisabled={isMessageActionDisabled}
        onOpenMessagePreview={onOpenMessagePreview}
      />
    );
  }
  
  return (
    <div className={s.workspace}>
      <CampaignAccountsList
        readOnly={readOnly}
        accounts={accounts}
        campaignContent={campaign.campaignContent}
        selectedAddedAccountsId={selectedAccount?.addedAccountsId ?? null} 
        onAccountSelect={setSelectedAddedAccountsId} 
      />
      
      <div className={s.content}>
        {selectedAccount ? (
          <>
            <CampaignAccountHeader
              readOnly={readOnly}
              username={selectedAccount.username}
              socialMedia={selectedAccount.socialMedia}
              followers={selectedAccount.followers}
              onRemove={() => onAccountRemove(selectedAccount.addedAccountsId)}
            />

            {view === "strategy" ? (
              <CampaignAccountEditor
                readOnly={readOnly}
                key={`${selectedAccount.addedAccountsId}:${editorRevision}`}
                account={selectedAccount}
                campaignContent={campaign.campaignContent}
                onAccountContentChange={onAccountContentChange}
                onCreateContentForAccount={onCreateContentForAccount}
                onAccountDescriptionChange={onAccountDescriptionChange}
                onAccountBriefChange={onAccountBriefChange}
                onCreateBriefForAccount={onCreateBriefForAccount}
                onCreateDescriptionForAccount={onCreateDescriptionForAccount}
                onUpdateDescriptionForAccount={onUpdateDescriptionForAccount}
                onUpdateBriefForAccount={onUpdateBriefForAccount}
                onUpdateContentTaggedLink={onUpdateContentTaggedLink}
                onUpdateContentTaggedUser={onUpdateContentTaggedUser}
                onAccountDateRequestChange={onAccountDateRequestChange}
                onDeleteContentDescription={onDeleteContentDescription}
                onDeleteContentBrief={onDeleteContentBrief}
                onDeleteCampaignContent={onDeleteCampaignContent}
              />
            ) : (
              <CampaignAccountAudience
                key={selectedAccount.addedAccountsId}
                countries={selectedAccount.countries}
                genres={selectedAccount.genres}
              />
            )}
          </>
        ) : (
          <p>No accounts in the campaign yet</p>
        )}
      </div>
    </div>
  );
};
