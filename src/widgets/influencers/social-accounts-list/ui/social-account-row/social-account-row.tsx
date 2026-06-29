import React from "react";
import clsx from "clsx";

import { EditSocialAccountLink } from "@/features/influencers/edit-social-account-link";

import type { TSocialAccountShort } from "@/entities/influencers/social-account/model/social-account.types.ts";
import type { TPlatform } from "@/shared/types/types.ts";

import s from './social-account-row.module.scss';

interface SocialAccountRowProps {
  platform: TPlatform;
  account: TSocialAccountShort;
  index: number;
}

export const SocialAccountRow: React.FC<SocialAccountRowProps> = ({
  platform,
  account,
  index,
}) => {
  return (
    <div className={s.socialAccountRow}>
      <div className={s.accountInfo}>
        <span className={clsx(s.badge)}>
          {index + 1}
        </span>
        <span className={s.username}>{account.username || ""}</span>
      </div>

      <EditSocialAccountLink platform={platform} accountId={account.accountId}/>
    </div>
  );
};
