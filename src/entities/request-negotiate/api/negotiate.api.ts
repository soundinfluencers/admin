import { $api } from "@/app/api/http.ts";
import type { IGetNegotiateMessagesResponse, ISendNegotiateMessagesRequest } from "../model/negotiate.types.ts";

export const getNegotiateMessages = async (requestId: string) => {
  console.log("Fetching negotiate messages...: ", requestId);

  const { data } = await $api.get<IGetNegotiateMessagesResponse>(`/admin/requests/${requestId}/negotiation/messages`);

  return data.data;
}

export const openNegotiateThreadApi = async (requestId: string) => {
  await $api.post<void>(`/admin/requests/${requestId}/negotiation`);
}

export const sendNegotiateMessageApi = async ({
  requestId,
  body,
}: ISendNegotiateMessagesRequest) => {
  await $api.post<void>(`/admin/requests/${requestId}/negotiation/messages`, {
    body,
  });
}

export const markNegotiateMessageAsReadApi = async (requestId: string) => {
  await $api.patch<void>(`/admin/requests/${requestId}/negotiation/read`);
}
