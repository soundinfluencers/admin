import { useState } from "react";
import { CampaignAccountsList } from "../campaign-accounts-list/campaign-accounts-list.tsx";
import { CampaignAccountHeader } from "../campaign-account-header/campaign-account-header.tsx";
import { CampaignAccountEditor } from "../campaign-account-editor/campaign-account-editor.tsx";
import { CampaignAccountAudience } from "../campaign-account-audience/campaign-account-audience.tsx";

import type { TCampaignView } from "@/shared/constants/campaign-view.ts";
import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

import s from './campaign-workspace.module.scss';

interface CampaignWorkspaceProps {
  campaign: ICampaignDetails;
  view: TCampaignView;
  onAccountContentChange: (socialAccountId: string, campaignContentItemId: string) => void;
  onCreateContentForAccount: (socialAccountId: string, mainLink: string) => void;
  onAccountDescriptionChange: (socialAccountId: string, descriptionId: string) => void;
  onAccountBriefChange: (socialAccountId: string, additionalBriefId: string) => void;
  onCreateBriefForAccount: (socialAccountId: string, text: string) => void;
  onCreateDescriptionForAccount: (socialAccountId: string, text: string) => void;
  onUpdateDescriptionForAccount: (campaignContentItemId: string, descriptionId: string, text: string) => void;
  onUpdateBriefForAccount: (campaignContentItemId: string, additionalBriefId: string, text: string) => void;
  onDeleteContentDescription: (campaignContentItemId: string, descriptionId: string) => void;
  onDeleteContentBrief: (campaignContentItemId: string, additionalBriefId: string) => void;
  onUpdateContentTaggedLink: (campaignContentItemId: string, taggedUser: string) => void;
  onUpdateContentTaggedUser: (campaignContentItemId: string, taggedLink: string) => void;
  onAccountDateRequestChange: (socialAccountId: string, dateRequest: string) => void;
  onDeleteCampaignContent: (campaignContentItemId: string) => void;
  onAccountRemove: (socialAccountId: string) => void;
}

export const CampaignWorkspace = ({
  campaign,
  view,
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
  onAccountDateRequestChange,
  onDeleteContentDescription,
  onDeleteContentBrief,
  onDeleteCampaignContent,
  onAccountRemove,
}: CampaignWorkspaceProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  
  const accounts = campaign.addedAccounts;
  
  const selectedAccount = accounts.find(
    (account) => account.socialAccountId === selectedAccountId,
  ) ?? 
    accounts[0] ?? 
    null;

  if (view === "insights") {
    return <div>Accounts table will be here</div>;
  }
  
  return (
    <div className={s.workspace}>
      <CampaignAccountsList 
        accounts={accounts}
        campaignContent={campaign.campaignContent}
        selectedAccountId={selectedAccount?.socialAccountId ?? null} 
        onAccountSelect={setSelectedAccountId} 
      />
      
      <div className={s.content}>
        {selectedAccount ? (
          <>
            <CampaignAccountHeader
              username={selectedAccount.username}
              socialMedia={selectedAccount.socialMedia}
              followers={selectedAccount.followers}
              onRemove={() => onAccountRemove(selectedAccount.socialAccountId)}
            />

            {view === "strategy" ? (
              <CampaignAccountEditor
                key={selectedAccount.socialAccountId}
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
                key={selectedAccount.socialAccountId}
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
