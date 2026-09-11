import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSendNegotiateMessageMutation } from "./use-send-negotiate-message-mutation.ts";
import { createNegotiationMessageTemplate } from "../model/negotiation-message-template.ts";
import { negotiateFormSchema, type TNegotiateFormValues } from "./negotiate-form.schema.ts";
import type { TRequestSpecifiedStatus, TRequestType } from "@/entities/requests/model/requests.types.ts";

interface NegotiateFormParams {
  requestId: string;
  requestStatus: TRequestSpecifiedStatus;
  requestType: TRequestType;
  submittedBy: string;
}

export const useNegotiateForm = ({
  requestId,
  requestStatus,
  requestType,
  submittedBy,
}: NegotiateFormParams) => {
  const methods = useForm<TNegotiateFormValues>({
    resolver: zodResolver(negotiateFormSchema),
    defaultValues: {
     message:
       requestType === "NEW_CLIENT_REQUEST" && requestStatus !== "NEGOTIATION"
         ? createNegotiationMessageTemplate(submittedBy)
         : "",
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const {
    mutateAsync: sendNegotiateMessage,
    isPending,
  } = useSendNegotiateMessageMutation({
    requestId,
    requestStatus,
    requestType,
  });

  const onSubmit: SubmitHandler<TNegotiateFormValues> = async (values) => {
    await sendNegotiateMessage(values);

    methods.reset({ message: "" });
  };

  return {
    methods,
    onSubmit,
    isPending,
  };
};
