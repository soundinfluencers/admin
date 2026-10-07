import clsx from "clsx";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/shared/ui";
import { TextInput } from "@/shared/ui/v2/react-hook-form-inputs/text-input-v2";

import {
  postLinkSchema,
  type TPostLinkFormValues,
} from "../model/edit-post-link.schema.ts";

import s from "./edit-post-link.module.scss";

interface EditPostLinkFormProps {
  value: string;
  onApply: (value: string) => void;
  onCancel: () => void;
}

export const EditPostLinkForm = ({
  value,
  onApply,
  onCancel,
}: EditPostLinkFormProps) => {
  const methods = useForm<TPostLinkFormValues>({
    resolver: zodResolver(postLinkSchema),
    defaultValues: {
      postLink: value,
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const postLink = useWatch({
    control,
    name: "postLink",
  });

  const isUnchanged = postLink.trim() === value.trim();

  const onSubmit = (data: TPostLinkFormValues) => {
    onApply(data.postLink);
  };

  return (
    <Form
      className={s.form}
      methods={methods}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextInput<TPostLinkFormValues>
        name="postLink"
        label="Post link"
        placeholder="https://"
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        readOnly={isSubmitting}
        rootClassName={s.rootInput}
      />

      <div className={s.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={s.action}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!isValid || isUnchanged || isSubmitting}
          className={clsx(s.action, s.save)}
        >
          Apply
        </button>
      </div>
    </Form>
  );
};
