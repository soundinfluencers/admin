import { useEffect } from "react";
import { type SubmitErrorHandler, type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scrollToFirstFormError } from "../libs/scroll-to-first-error.helpers.ts";
import { createSocialAccountFormSchema, type TSocialAccountFormValues } from "./social-account-form.schema.ts";
import type { TPlatform } from "@/shared/types/types.ts";

interface SocialAccountFormParams {
  socialMedia: TPlatform;
  defaultValues: TSocialAccountFormValues;
  onHandleSubmit: (values: TSocialAccountFormValues) => Promise<void> | void;
}

export const useSocialAccountForm = ({
  socialMedia,
  defaultValues,
  onHandleSubmit,
}: SocialAccountFormParams) => {
  const methods = useForm<TSocialAccountFormValues>({
    resolver: zodResolver(createSocialAccountFormSchema(socialMedia)),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  const profileCategory = useWatch({
    control: methods.control,
    name: "profileCategory",
  });

  const onValid: SubmitHandler<TSocialAccountFormValues> = async (values) => {
    console.log("Form submitted with values:", values);

    await onHandleSubmit(values);
  };

  const onInvalid: SubmitErrorHandler<TSocialAccountFormValues> = (errors) => {
    scrollToFirstFormError(errors, methods);
  };

  const handleSubmit = methods.handleSubmit(onValid, onInvalid);

  return {
    methods,
    profileCategory,
    handleSubmit,
  };
};
