import React from "react";
import { Button, Form, TextAreaInput } from "@/shared/ui";
import { useNegotiateForm } from "../../model/use-negotiate-form.ts";
import type { TNegotiateFormValues } from "../../model/negotiate-form.schema.ts";
import type { TRequestSpecifiedStatus, TRequestType } from "@/entities/requests/model/requests.types.ts";

import s from './negotiate-form.module.scss';

interface NegotiateFormProps {
  requestId: string;
  requestStatus: TRequestSpecifiedStatus;
  requestType: TRequestType;
}

export const NegotiateForm: React.FC<NegotiateFormProps> = ({
  requestId,
  requestStatus,
  requestType,
}) => {
  const { methods, onSubmit, isPending } = useNegotiateForm({
    requestId,
    requestStatus,
    requestType,
  });

  return (
    <Form
      className={s.form}
      methods={methods}
      onSubmit={methods.handleSubmit(onSubmit)}
    >

      <TextAreaInput<TNegotiateFormValues>
        name="message"
        label="Negotiate message"
        placeholder="Enter message here...."
      />

      <Button
        className={s.submit}
        type="submit"
        variant="primary"
        size="large"
        disabled={isPending}
      >
        {isPending ? "Sending..." : "Send"}
      </Button>
    </Form>
  );
};
