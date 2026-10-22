import clsx from "clsx";
import { SOCIAL_MEDIA_ICONS } from "@/shared/config/social-media-icons.ts";

import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";

import s from "./campaign-table-account.module.scss";

type CampaignTableAccountProps = Pick<
  ICampaignDetails["addedAccounts"][number],
  "username" | "socialMedia"
> & {
  className?: string;
};

export const CampaignTableAccount = ({
  username,
  socialMedia,
  className,
}: CampaignTableAccountProps) => {
  const Icon = SOCIAL_MEDIA_ICONS[socialMedia];

  return (
    <div className={clsx(s.account, className)}>
      <span className={s.avatar} aria-hidden="true">
        <Icon/>
      </span>
      <span className={s.username} title={username}>
        {username}
      </span>
    </div>
  );
};
