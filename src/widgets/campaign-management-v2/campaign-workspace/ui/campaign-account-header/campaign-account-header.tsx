import { Button } from "@/shared/ui/v2/button-v2";
import { SOCIAL_MEDIA_LABELS, type TSocialMedia } from "@/shared/constants/social-media-taxonomy.ts";

import TrashIcon from "@/shared/assets/icons/trash.svg?react";

import s from './campaign-account-header.module.scss';

interface CampaignAccountHeaderProps {
  readOnly: boolean;
  isRemoveDisabled: boolean;
  username: string;
  socialMedia: TSocialMedia;
  followers: number;
  onRemove: () => void;
}

export const CampaignAccountHeader = ({
  readOnly,
  isRemoveDisabled,
  username,
  socialMedia,
  followers,
  onRemove,
}: CampaignAccountHeaderProps) => {
  return (
    <div className={s.header}>
      <div className={s.detailsMeta}>
        <h3 className={s.username}>{username}</h3>
        <p>
          {SOCIAL_MEDIA_LABELS[socialMedia]} · {followers} followers
        </p>
      </div>

      {!readOnly && (
        <Button
          variant="danger"
          label="Remove influencer"
          icon={TrashIcon}
          disabled={isRemoveDisabled}
          aria-label="Remove account"
          onClick={onRemove}
        />
      )}
    </div>
  );
};
