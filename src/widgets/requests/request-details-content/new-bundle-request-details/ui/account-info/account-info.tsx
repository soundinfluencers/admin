import React from "react";

import { SOCIAL_MEDIA_DARK_ICONS, SOCIAL_MEDIA_LABEL_MAP } from "@/widgets/requests/model/social-media.constants.ts";
import { ACCOUNT_INFO_FIELDS } from "../../model/new-bundle-request-details.config.ts";
import type { IBundleAccount } from "@/entities/requests/model/requests.types.ts";

import s from './account-info.module.scss';

interface AccountInfoProps {
  accounts: IBundleAccount[];
}

export const AccountInfo: React.FC<AccountInfoProps> = ({ accounts }) => {
  return (
    <ul className={s.accounts}>
      {accounts.map((account) => (
        <li
          key={account.accountId}
          className={s.root}
        >
          <div className={s.head}>
            <img
              className={s.icon}
              src={SOCIAL_MEDIA_DARK_ICONS[account.socialMedia]}
              alt=""
              width={24}
              height={24}
              aria-hidden
            />

            <h3 className={s.title}>
              {SOCIAL_MEDIA_LABEL_MAP[account.socialMedia]}
            </h3>
          </div>

          <ul className={s.fields}>
            {ACCOUNT_INFO_FIELDS.map(({ key, label }) => (
              <li
                key={key}
                className={s.field}
              >
                <span className={s.label}>{label}</span>
                <span className={s.value}>{account[key]}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};
