import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/shared/ui";
import { TextInput } from "@/shared/ui/v2/react-hook-form-inputs/text-input-v2";
import { Button } from "@/shared/ui/v2/button-v2";

import {
  postLinkSchema,
  type TPostLinkFormValues,
} from "../model/edit-post-link.schema.ts";

import s from "./edit-post-link.module.scss";

interface EditPostLinkFormProps {
  value: string;
  disabled?: boolean;
  onApply: (value: string) => void;
  onCancel: () => void;
}

export const EditPostLinkForm = ({
  value,
  disabled = false,
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
    if (!disabled) onApply(data.postLink);
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
        readOnly={disabled || isSubmitting}
        rootClassName={s.rootInput}
      />

      <div className={s.actions}>
        <Button 
          label="Cancel"
          onClick={onCancel}
        />
        
        <Button
          type="submit"
          variant="primary"
          label="Apply"
          disabled={disabled || !isValid || isUnchanged || isSubmitting}
        />
      </div>
    </Form>
  );
};
