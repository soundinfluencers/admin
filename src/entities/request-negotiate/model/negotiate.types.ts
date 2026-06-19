import type { TRequestType } from "@/entities/requests/model/requests.types.ts";

interface INegotiateThread {
  _id: string;
  requestId: string;
  requestType: TRequestType;
  status: "ACTIVE";
  participantEmail: string;
  participantName: string;
  subject: string;
  unreadForAdmin: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastMessageAt: string;
}

interface INegotiateMessage {
  _id: string;
  threadId: string;
  direction: "INBOUND" | "OUTBOUND";
  fromEmail: string;
  toEmail: string;
  authorAdminId?: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  messageId: string;
  inReplyTo: string;
  references: string[];
  deliveryStatus: "SENT" | "FAILED" | "QUEUED";
  attachments: string[];
  createdAt: string;
  __v: number;
}

export interface INegotiateEntity {
  thread: INegotiateThread;
  messages: INegotiateMessage[];
}

export interface IGetNegotiateMessagesResponse {
  statusCode: number;
  messages: string;
  data: INegotiateEntity;
}

export interface ISendNegotiateMessagesRequest {
  requestId: string;
  body: string;
}
