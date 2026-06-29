import { NumericInput } from "@/shared/ui";
import type { TSocialAccountFormValues } from "@/features/influencers/social-account-form";

import s from './performance-fields.module.scss';

export const PerformanceFields = () => {
  return (
    <div className={s.performanceFields}>
      <NumericInput<TSocialAccountFormValues>
        name="averageViews"
        label="Average views"
        placeholder="Enter average views"
        autoComplete="off"
        allowDecimal
      />
      <NumericInput<TSocialAccountFormValues>
        name="engagementRate"
        label="Engagement rate"
        placeholder="Enter engagement rate"
        autoComplete="off"
        allowDecimal
      />
    </div>
  );
};
