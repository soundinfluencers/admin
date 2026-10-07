import { SOCIAL_MEDIA_LABELS, type TSocialMedia } from "@/shared/constants/social-media-taxonomy.ts";

import Trash from "@/shared/assets/icons/trash.svg?react";

import s from './campaign-account-header.module.scss';

interface CampaignAccountHeaderProps {
  readOnly: boolean;
  username: string;
  socialMedia: TSocialMedia;
  followers: number;
  onRemove: () => void;
}

export const CampaignAccountHeader = ({
  readOnly,
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
        <button
          type="button"
          className={s.removeBtn}
          onClick={onRemove}
          aria-label="Remove account"
        >
          <Trash className={s.icon}/>
          Remove influencer
        </button>
      )}
    </div>
  );
};
