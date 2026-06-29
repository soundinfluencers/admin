import type { FieldErrors, UseFormReturn } from "react-hook-form";
import type { TSocialAccountFormValues } from "../model/social-account-form.schema.ts";
import { ERROR_ANCHOR_MAP } from "../model/social-account-form.confing.ts";

export const scrollToFirstFormError = (
  errors: FieldErrors<TSocialAccountFormValues>,
  methods: UseFormReturn<TSocialAccountFormValues>
) => {
  const firstErrorName = Object.keys(errors)[0] as keyof TSocialAccountFormValues | undefined;

  if (!firstErrorName) return;

  const anchorId = ERROR_ANCHOR_MAP[firstErrorName];

  if (anchorId) {
    document.getElementById(anchorId)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    return;
  }

  methods.setFocus(firstErrorName);
};
