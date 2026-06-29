import { useFormContext } from "react-hook-form";
import { FormBlockHeader } from "../form-block-header/form-block-header.tsx";
import { CountryAutocompleteField, PercentageInput } from "@/shared/ui";
import type { TSocialAccountFormValues } from "@/features/influencers/social-account-form";

import s from './audience-insights.module.scss';

export const AudienceInsights = () => {
  const { getFieldState, formState } = useFormContext<TSocialAccountFormValues>();
  const { error: countriesError } = getFieldState("countries", formState);

  return (
    <div
      id="countries"
      className={s.audienceInsights}
    >
      <FormBlockHeader
        title="Audience insights"
        subtitle="Enter the top 5 audience countries and their reach percentage"
        error={countriesError?.root?.message ?? ""}
      />

      <div className={s.fields}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={s.field}>

            <div className={s.label}>
              <span className={s.fieldLabel}>#{index + 1}</span>
            </div>

            <div className={s.inputs}>
              <div className={s.percentage}>
                <PercentageInput<TSocialAccountFormValues>
                  name={`countries.${index}.percentage`}
                  placeholder={`${Math.max(0, 25 - index * 5)}%`}
                  autoComplete="off"
                  className={s.percentageInput}
                />
              </div>

              <div className={s.country}>
                <CountryAutocompleteField<TSocialAccountFormValues>
                  name={`countries.${index}.country`}
                  countriesName="countries"
                  placeholder="Find country"
                  index={index}
                  size="sm"
                />
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
