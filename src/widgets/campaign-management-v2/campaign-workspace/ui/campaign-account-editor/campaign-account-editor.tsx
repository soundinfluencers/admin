import { CampaignPlacementAssignment } from "./campaign-placement-assignment/campaign-placement-assignment.tsx";
import { CampaignTextEditor } from "./campaign-text-editor/campaign-text-editor.tsx";
import { CampaignStorySupport } from "./campaign-story-support/campaign-story-support.tsx";
import { EditSection } from "./edit-section/edit-section.tsx";

import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

import s from "./campaign-account-editor.module.scss";

interface CampaignAccountEditorProps {
  account: ICampaignDetails["addedAccounts"][number];
  campaignContent: ICampaignDetails["campaignContent"];
  onAccountContentChange: (socialAccountId: string, campaignContentItemId: string) => void;
  onCreateContentForAccount: (socialAccountId: string, mainLink: string) => void;
  onAccountDescriptionChange: (socialAccountId: string, descriptionId: string) => void;
  onAccountBriefChange: (socialAccountId: string, additionalBriefId: string) => void;
  onCreateDescriptionForAccount: (socialAccountId: string, text: string) => void;
  onCreateBriefForAccount: (socialAccountId: string, text: string) => void;
  onUpdateDescriptionForAccount: (campaignContentItemId: string, descriptionId: string, text: string) => void;
  onUpdateBriefForAccount: (campaignContentItemId: string, additionalBriefId: string, text: string) => void;
  onDeleteContentDescription: (campaignContentItemId: string, descriptionId: string) => void;
  onDeleteContentBrief: (campaignContentItemId: string, additionalBriefId: string) => void;
  onUpdateContentTaggedLink: (campaignContentItemId: string, taggedUser: string) => void;
  onUpdateContentTaggedUser: (campaignContentItemId: string, taggedLink: string) => void;
  onAccountDateRequestChange: (socialAccountId: string, dateRequest: string) => void;
  onDeleteCampaignContent: (campaignContentItemId: string) => void;
}

export const CampaignAccountEditor = ({
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
    onAccountContentChange(
      account.socialAccountId,
      campaignContentItemId,
    )
  };
  
  const handleContentCreate = (mainLink: string) => {
    onCreateContentForAccount(
      account.socialAccountId,
      mainLink,
    )
  };
  
  const handleDescriptionSelect = (descriptionId: string) => {
    onAccountDescriptionChange(
      account.socialAccountId,
      descriptionId,
    );
  };
  
  const handleBriefSelect = (additionalBriefId: string) => {
    onAccountBriefChange(
      account.socialAccountId,
      additionalBriefId,
    );
  };
  
  const handleDescriptionCreate = (text: string) => {
    onCreateDescriptionForAccount(
      account.socialAccountId,
      text,
    )
  };
  
  const handleBriefCreate = (text: string) => {
    onCreateBriefForAccount(
      account.socialAccountId,
      text,
    )
  };
  
  const handleDescriptionUpdate = (descriptionId: string, text: string) => {
    if (!selectedContent) return;
    
    onUpdateDescriptionForAccount(
      selectedContent._id,
      descriptionId,
      text,
    )
  };
  
  const handleBriefUpdate = (additionalBriefId: string, text: string) => {
    if (!selectedContent) return;
    
    onUpdateBriefForAccount(
      selectedContent._id,
      additionalBriefId,
      text,
    )
  };
  
  const handleDescriptionDelete = (descriptionId: string) => {
    if (!selectedContent) return;
    
    onDeleteContentDescription(
      selectedContent._id,
      descriptionId,
    );
  };
  
  const handleBriefDelete = (additionalBriefId: string) => {
    if (!selectedContent) return;
    
    onDeleteContentBrief(
      selectedContent._id,
      additionalBriefId,
    );
  };

  const handleTaggedUserChange = (taggedUser: string) => {
    if (!selectedContent) return;

    onUpdateContentTaggedUser(
      selectedContent._id, 
      taggedUser,
    );
  };

  const handleTaggedLinkChange = (taggedLink: string) => {
    if (!selectedContent) return;

    onUpdateContentTaggedLink(
      selectedContent._id, 
      taggedLink,
    );
  };
  
  const handleDateRequestChange = (dateRequest: string) => {
    onAccountDateRequestChange(account.socialAccountId, dateRequest);
  };

  return (
    <div className={s.editor}>
      <EditSection
        title="Placement assignment"
        subtitle="The same video can be assigned to several placements with different copy and briefs."
      >
        <CampaignPlacementAssignment
          options={contentOptions}
          dateRequest={account.dateRequest}
          selectedId={account.selectedContent?.campaignContentItemId ?? null}
          onContentSelect={handleContentSelect}
          onContentCreate={handleContentCreate}
          onDelete={onDeleteCampaignContent}
          onDateRequestChange={handleDateRequestChange}
        />
      </EditSection>

      <EditSection
        title="Post description"
        subtitle="Select a saved description, edit it for all accounts using it, or create a new one."
      >
        <CampaignTextEditor
          key={`description:${selectedContent?._id ?? "no-content"}`}
          label="Description"
          placeholder="post description…"
          options={descriptionOptions}
          selectedId={account.selectedContent?.descriptionId ?? null}
          onSelect={handleDescriptionSelect}
          onCreate={handleDescriptionCreate}
          onUpdate={handleDescriptionUpdate}
          onDelete={handleDescriptionDelete}
        />
      </EditSection>

      <EditSection
        title="Additional brief"
        subtitle="Select a saved brief, edit it for all accounts using it, or create a new one."
      >
        <CampaignTextEditor
          key={`brief:${selectedContent?._id ?? "no-content"}`}
          label="Brief"
          placeholder="additional brief…"
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
