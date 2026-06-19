import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNegotiateMessageAsReadApi, negotiateQueryKeys,
  openNegotiateThreadApi,
  sendNegotiateMessageApi,
} from "@/entities/request-negotiate";
import { requestDetailsQueryKeys, requestsQueryKeys } from "@/entities/requests";
import type { TNegotiateFormValues } from "@/features/requests/request-negotiate/model/negotiate-form.schema.ts";
import type { TRequestSpecifiedStatus, TRequestType } from "@/entities/requests/model/requests.types.ts";

interface UseSendNegotiateMessageMutationParams {
  requestId: string;
  requestStatus: TRequestSpecifiedStatus;
  requestType: TRequestType;
}

const canSendNegotiationMessage = (status: TRequestSpecifiedStatus) => {
  return status === "WAITING_FOR_ADMIN" || status === "NEGOTIATION";
};

export const useSendNegotiateMessageMutation = ({
  requestId,
  requestStatus,
  requestType,
}: UseSendNegotiateMessageMutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: TNegotiateFormValues) => {
      if (!canSendNegotiationMessage(requestStatus)) {
        throw new Error(
          `Cannot send negotiation message for request status: ${requestStatus}`,
        );
      }

      const body = values.message.trim();

      if (!body) {
        throw new Error("Message is required");
      }

      const isWaitingForAdmin = requestStatus === "WAITING_FOR_ADMIN";
      const isNegotiation = requestStatus === "NEGOTIATION";

      if (isWaitingForAdmin) {
        await openNegotiateThreadApi(requestId);
      }

      await sendNegotiateMessageApi({
        requestId,
        body,
      });

      if (isNegotiation) {
        try {
          await markNegotiateMessageAsReadApi(requestId);
        } catch (error) {
          console.error("Failed to mark negotiation messages as read:", error);
        }
      }
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: negotiateQueryKeys.detail(requestId),
        }),

        queryClient.invalidateQueries({
          queryKey: requestDetailsQueryKeys.detail({
            requestId,
            requestType,
          }),
        }),

        queryClient.invalidateQueries({
          queryKey: requestsQueryKeys.lists(),
        }),
      ]);
    },
  });
};
