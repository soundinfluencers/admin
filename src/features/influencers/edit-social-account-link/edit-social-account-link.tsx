import React from "react";
import { Link } from "react-router-dom";
import type { TSocialMedia } from "@/shared/types/types.ts";

import Edit from '@/assets/icons/influencers/edit.svg?react';

import s from './edit-social-account-link.module.scss';

interface EditSocialAccountLinkProps {
  platform: TSocialMedia;
  accountId: string;
}

export const EditSocialAccountLink: React.FC<EditSocialAccountLinkProps> = ({
  platform,
  accountId,
}) => {
  return (
    <Link
      className={s.editLink}
      to={`accounts/${platform}/${accountId}/edit`}
      aria-label="Edit account"
    >
      <Edit className={s.editIcon} width={18} height={18}/>
      Edit
    </Link>
  );
};
