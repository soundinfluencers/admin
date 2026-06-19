import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSendNegotiateMessageMutation } from "./use-send-negotiate-message-mutation.ts";
import { negotiateFormSchema, type TNegotiateFormValues } from "./negotiate-form.schema.ts";
import type { TRequestSpecifiedStatus, TRequestType } from "@/entities/requests/model/requests.types.ts";

interface NegotiateFormParams {
  requestId: string;
  requestStatus: TRequestSpecifiedStatus;
  requestType: TRequestType;
}

export const useNegotiateForm = ({
  requestId,
  requestStatus,
  requestType,
}: NegotiateFormParams) => {
  const methods = useForm<TNegotiateFormValues>({
    resolver: zodResolver(negotiateFormSchema),
    defaultValues: {
     message: '',
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

    methods.reset();
  };

  return {
    methods,
    onSubmit,
    isPending,
  };
};
