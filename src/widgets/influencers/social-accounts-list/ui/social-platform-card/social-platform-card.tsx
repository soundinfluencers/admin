import React, { type FC, type SVGProps } from "react";
import { CreateSocialAccountLink } from "@/features/influencers/create-social-account-link";
import { SocialAccountRow } from "../social-account-row/social-account-row.tsx";

import type { TPlatform } from "@/shared/types/types.ts";
import type { TSocialAccountShort } from "@/entities/influencers/social-account/model/social-account.types.ts";

import s from './social-platform-card.module.scss';

interface SocialPlatformCardProps {
  platform: TPlatform;
  platformLabel: string;
  platformIcon: FC<SVGProps<SVGSVGElement>>;
  accounts: TSocialAccountShort[];
}

export const SocialPlatformCard: React.FC<SocialPlatformCardProps> = ({
  platform,
  platformLabel,
  platformIcon: Icon,
  accounts,
}) => {
  return (
    <div className={s.socialPlatformCard}>
      <div className={s.header}>
        <div className={s.platformInfo}>
          <Icon
            className={s.platformIcon}
            width={37}
            height={37}
            aria-label={platformLabel}
          />
          <span className={s.label}>{platformLabel}</span>
        </div>

        <CreateSocialAccountLink platform={platform}/>
      </div>

      {accounts.length > 0 && (
        <div className={s.accountsList} role="listbox" aria-label="Connected accounts">
          {accounts.map((account, index) => (
            <SocialAccountRow
              key={account.accountId}
              platform={platform}
              account={account}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};
