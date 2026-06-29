import React, { Fragment } from "react";
import { ImageUploadField, NumericInput, TextInput } from "@/shared/ui";
import type {
  ISocialAccountMainInputConfig,
  TSocialAccountFormValues,
} from "@/features/influencers/social-account-form";

import s from './account-main-fields.module.scss';

interface AccountMainFieldsSectionProps {
  inputs: ISocialAccountMainInputConfig[];
}

export const AccountMainFields: React.FC<AccountMainFieldsSectionProps> = ({ inputs }) => {

  const renderFields = (input: ISocialAccountMainInputConfig) => {
    switch (input.type) {
      case "text":
        return (
          <TextInput<TSocialAccountFormValues>
            name={input.name}
            label={input.label}
            placeholder={input.placeholder}
            autoComplete="off"
          />
        );
      case "number":
        return (
          <NumericInput<TSocialAccountFormValues>
            name={input.name}
            label={input.label}
            placeholder={input.placeholder}
            autoComplete="off"
          />
        );
      case "file":
        return (
          <ImageUploadField<TSocialAccountFormValues>
            name={input.name}
            label={input.label}
            placeholder={input.placeholder}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className={s.accountMainFields}>
      {inputs.map((input) => (
        <Fragment key={input.name}>
          {renderFields(input)}
        </Fragment>
      ))}
    </div>
  );
};
