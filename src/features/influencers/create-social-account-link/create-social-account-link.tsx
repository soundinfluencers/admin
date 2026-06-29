import React from "react";
import { Link } from "react-router-dom";
import type { TPlatform } from "@/shared/types/types.ts";

import Plus from '@/assets/icons/plus.svg?react';

import s from './create-social-account-link.module.scss';

interface CreateSocialAccountLinkProps {
  platform: TPlatform;
}

export const CreateSocialAccountLink: React.FC<CreateSocialAccountLinkProps> = ({
  platform,
}) => {
  return (
    <Link
      className={s.addAccount}
      to={`accounts/${platform}/create`}
    >
      <Plus
        className={s.addIcon}
        width={24}
        height={24}
        aria-label={'Create new account'}
      />
      Add
    </Link>
  );
};
