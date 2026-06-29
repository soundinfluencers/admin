import React from "react";
import { useFormContext } from "react-hook-form";
import { FormBlockHeader } from "../form-block-header/form-block-header.tsx";
import { CheckboxTreeField } from "@/shared/ui";
import { CONTENT_FOCUS_OPTIONS, type TSocialAccountFormValues } from "@/features/influencers/social-account-form";

import s from './content-focus.module.scss';

export const ContentFocus: React.FC = () => {
  const { getFieldState, formState } = useFormContext<TSocialAccountFormValues>();
  const { error: contentFocus } = getFieldState("creatorContentFocus", formState);

  return (
    <div id='contentFocus' className={s.contentFocus}>
      <FormBlockHeader
        title="Content focus"
        subtitle="Select all the applicable"
        error={contentFocus?.message}
      />

      <CheckboxTreeField<TSocialAccountFormValues>
        name="creatorContentFocus"
        options={CONTENT_FOCUS_OPTIONS}
        variant="creator"
      />
    </div>
  );
};
