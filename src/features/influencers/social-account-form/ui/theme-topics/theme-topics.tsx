import React from "react";
import { FormBlockHeader } from "../form-block-header/form-block-header.tsx";
import { CheckboxTreeField } from "@/shared/ui";
import { THEME_TOPICS, type TSocialAccountFormValues } from "@/features/influencers/social-account-form";

import s from './theme-topics.module.scss';

export const ThemeTopics: React.FC = () => {
  return (
    <div className={s.themeTopics}>
      <FormBlockHeader
        title="Theme topics"
        subtitle="Select this if the main core theme of the page (optional)"
      />

      <CheckboxTreeField<TSocialAccountFormValues>
        name="communityThemeTopics"
        options={THEME_TOPICS}
      />
    </div>
  );
};
