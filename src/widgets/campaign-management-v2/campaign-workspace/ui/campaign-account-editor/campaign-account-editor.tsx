import { CampaignPlacementAssignment } from "./campaign-placement-assignment/campaign-placement-assignment.tsx";
import { CampaignTextEditor } from "./campaign-text-editor/campaign-text-editor.tsx";
import { CampaignStorySupport } from "./campaign-story-support/campaign-story-support.tsx";
import { EditSection } from "./edit-section/edit-section.tsx";

import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

import s from "./campaign-account-editor.module.scss";

interface CampaignAccountEditorProps {
  readOnly: boolean;
  disabled?: boolean;
  account: ICampaignDetails["addedAccounts"][number];
  campaignContent: ICampaignDetails["campaignContent"];
  onAccountContentChange: (addedAccountsId: string, campaignContentItemId: string) => void;
  onCreateContentForAccount: (addedAccountsId: string, mainLink: string) => void;
  onAccountDescriptionChange: (addedAccountsId: string, descriptionId: string) => void;
  onAccountBriefChange: (addedAccountsId: string, additionalBriefId: string) => void;
  onCreateDescriptionForAccount: (addedAccountsId: string, text: string) => void;
  onCreateBriefForAccount: (addedAccountsId: string, text: string) => void;
  onUpdateDescriptionForAccount: (campaignContentItemId: string, descriptionId: string, text: string) => void;
  onUpdateBriefForAccount: (campaignContentItemId: string, additionalBriefId: string, text: string) => void;
  onDeleteContentDescription: (campaignContentItemId: string, descriptionId: string) => void;
  onDeleteContentBrief: (campaignContentItemId: string, additionalBriefId: string) => void;
  onUpdateContentTaggedLink: (campaignContentItemId: string, taggedUser: string) => void;
  onUpdateContentTaggedUser: (campaignContentItemId: string, taggedLink: string) => void;
  onAccountDateRequestChange: (addedAccountsId: string, dateRequest: string) => void;
  onDeleteCampaignContent: (campaignContentItemId: string) => void;
}

export const CampaignAccountEditor = ({
  readOnly,
  disabled = false,
  account,
  campaignContent,
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
  onDeleteContentDescription,
  onDeleteContentBrief,
  onAccountDateRequestChange,
  onDeleteCampaignContent,
}: CampaignAccountEditorProps) => {
  const selectedContent = campaignContent.find(
    (item) =>
      item._id === account.selectedContent?.campaignContentItemId,
  );
  
  const contentOptions = campaignContent.map(
    (content, index) => ({
      id: content._id,
      label: `Video ${index + 1}`,
      mainLink: content.mainLink,
    }));
  
  const descriptionOptions = (selectedContent?.descriptions ?? []).map(
    (item) => ({
      id: item._id,
      text: item.description,
    }),
  );

  const briefOptions = Array.isArray(selectedContent?.additionalBrief)
    ? selectedContent.additionalBrief.map((item) => ({
      id: item._id,
      text: item.additionalBrief,
    }))
    : [];
  
  const handleContentSelect = (campaignContentItemId: string) => {
    if (readOnly || disabled) return;
    
    onAccountContentChange(
      account.addedAccountsId,
      campaignContentItemId,
    )
  };
  
  const handleContentCreate = (mainLink: string) => {
    if (readOnly || disabled) return;
    
    onCreateContentForAccount(
      account.addedAccountsId,
      mainLink,
    )
  };
  
  const handleDescriptionSelect = (descriptionId: string) => {
    if (readOnly || disabled) return;
    
    onAccountDescriptionChange(
      account.addedAccountsId,
      descriptionId,
    );
  };
  
  const handleBriefSelect = (additionalBriefId: string) => {
    if (readOnly || disabled) return;
    
    onAccountBriefChange(
      account.addedAccountsId,
      additionalBriefId,
    );
  };
  
  const handleDescriptionCreate = (text: string) => {
    if (readOnly || disabled) return;
    
    onCreateDescriptionForAccount(
      account.addedAccountsId,
      text,
    )
  };
  
  const handleBriefCreate = (text: string) => {
    if (readOnly || disabled) return;
    
    onCreateBriefForAccount(
      account.addedAccountsId,
      text,
    )
  };
  
  const handleDescriptionUpdate = (descriptionId: string, text: string) => {
    if (readOnly || disabled || !selectedContent) return;
    
    onUpdateDescriptionForAccount(
      selectedContent._id,
      descriptionId,
      text,
    )
  };
  
  const handleBriefUpdate = (additionalBriefId: string, text: string) => {
    if (readOnly || disabled || !selectedContent) return;
    
    onUpdateBriefForAccount(
      selectedContent._id,
      additionalBriefId,
      text,
    )
  };
  
  const handleDescriptionDelete = (descriptionId: string) => {
    if (readOnly || disabled || !selectedContent) return;
    
    onDeleteContentDescription(
      selectedContent._id,
      descriptionId,
    );
  };
  
  const handleBriefDelete = (additionalBriefId: string) => {
    if (readOnly || disabled || !selectedContent) return;
    
    onDeleteContentBrief(
      selectedContent._id,
      additionalBriefId,
    );
  };

  const handleTaggedUserChange = (taggedUser: string) => {
    if (readOnly || disabled || !selectedContent) return;

    onUpdateContentTaggedUser(
      selectedContent._id, 
      taggedUser,
    );
  };

  const handleTaggedLinkChange = (taggedLink: string) => {
    if (readOnly || disabled || !selectedContent) return;

    onUpdateContentTaggedLink(
      selectedContent._id, 
      taggedLink,
    );
  };
  
  const handleDateRequestChange = (dateRequest: string) => {
    if (readOnly || disabled) return;
    
    onAccountDateRequestChange(
      account.addedAccountsId, 
      dateRequest
    );
  };

  const handleContentDelete = (campaignContentItemId: string) => {
    if (readOnly || disabled) return;

    onDeleteCampaignContent(campaignContentItemId);
  };

  return (
    <div className={s.editor}>
      <EditSection
        title="Placement assignment"
        subtitle="The same video can be assigned to several placements with different copy and briefs."
      >
        <CampaignPlacementAssignment
          readOnly={readOnly}
          disabled={disabled}
          options={contentOptions}
          dateRequest={account.dateRequest}
          selectedId={account.selectedContent?.campaignContentItemId ?? null}
          onContentSelect={handleContentSelect}
          onContentCreate={handleContentCreate}
          onDelete={handleContentDelete}
          onDateRequestChange={handleDateRequestChange}
        />
      </EditSection>

      <EditSection
        title="Post description"
        subtitle="Select a saved description, edit it for all accounts using it, or create a new one."
      >
        <CampaignTextEditor
          readOnly={readOnly}
          disabled={disabled}
          key={`description:${selectedContent?._id ?? "no-content"}`}
          label="Description"
          placeholder="Enter new post description…"
          options={descriptionOptions}
          selectedId={account.selectedContent?.descriptionId ?? null}
          onSelect={handleDescriptionSelect}
          onCreate={handleDescriptionCreate}
          onUpdate={handleDescriptionUpdate}
          onDelete={handleDescriptionDelete}
        />
      </EditSection>

      <EditSection
        title="Brief"
        subtitle="Select a saved brief, edit it for all accounts using it, or create a new one."
      >
        <CampaignTextEditor
          readOnly={readOnly}
          disabled={disabled}
          key={`brief:${selectedContent?._id ?? "no-content"}`}
          label="Brief"
          placeholder="Enter new brief…"
          options={briefOptions}
          selectedId={account.selectedContent?.additionalBriefId ?? null}
          onSelect={handleBriefSelect}
          onCreate={handleBriefCreate}
          onUpdate={handleBriefUpdate}
          onDelete={handleBriefDelete}
        />
      </EditSection>

      <EditSection
        title="Story support"
        subtitle="Story tags and link shared by all accounts using this content."
      >
        <CampaignStorySupport
          readOnly={readOnly}
          disabled={disabled}
          key={`story-support:${selectedContent?._id ?? "no-content"}`}
          storyLink={selectedContent?.taggedLink ?? ""}
          storyTag={selectedContent?.taggedUser ?? ""}
          selectedId={selectedContent?._id ?? null}
          onStoryTagChange={handleTaggedUserChange}
          onStoryLinkChange={handleTaggedLinkChange}
        />
      </EditSection>
    </div>
  );
};
