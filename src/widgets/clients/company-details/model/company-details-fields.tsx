import React from "react";
import { ClientProposalAccessSwitch } from "@/features/clients/client-proposal-access-switch";
import { ClientNoteEditor } from "@/features/clients/client-note-editor";
import type { IClientDetails } from "@/entities/client/model/client.types.ts";

export type TInfoField<T> = {
  label: string;
  key: keyof T;
  render?: (data: T) => React.ReactNode;
}

export const leftFields = [
  {
    label: "First name",
    key: "firstName",
    render: (data: IClientDetails) => (
      <ClientNoteEditor
        initialValue={data.firstName}
        clientId={data.clientId}
        fieldKey="firstName"
      />
    ),
  },
  {
    label: "Last name",
    key: "lastName",
    render: (data: IClientDetails) => (
      <ClientNoteEditor
        initialValue={data.lastName}
        clientId={data.clientId}
        fieldKey="lastName"
      />
    ),
  },
  {
    label: "Email",
    key: "email",
    render: (data: IClientDetails) => (
      <ClientNoteEditor
        initialValue={data.email}
        clientId={data.clientId}
        fieldKey="email"
      />
    ),
  },
  {
    label: "Phone number",
    key: "phone",
    render: (data: IClientDetails) => (
      <ClientNoteEditor
        initialValue={data.phone}
        clientId={data.clientId}
        fieldKey="phone"
      />
    ),
  },
  {
    label: "Balance",
    key: "balance",
    render: (data: IClientDetails) => (
      <ClientNoteEditor
        initialValue={String(data.balance)}
        clientId={data.clientId}
        fieldKey="balance"
      />
    ),
  },
] satisfies TInfoField<IClientDetails>[];

export const rightFields = [
  {
    label: "Company",
    key: "company",
    render: (data: IClientDetails) => (
      <ClientNoteEditor
        initialValue={data.company}
        clientId={data.clientId}
        fieldKey="company"
      />
    ),
  },
  {
    label: "Company type",
    key: "companyType",
    render: (data: IClientDetails) => (
      <ClientNoteEditor
        initialValue={data.companyType}
        clientId={data.clientId}
        fieldKey="companyType"
      />
    ),
  },
  { label: "ID", key: "clientId" },
  {
    label: "Proposal access",
    key: "isProposalClient",
    render: (data: IClientDetails) => (
      <ClientProposalAccessSwitch
        value={data.isProposalClient}
        clientId={data.clientId}
        fieldKey="isProposalClient"
      />
    ),
  },
  { label: "Latest campaign", key: "latestCampaignName" },
] satisfies TInfoField<IClientDetails>[];

export const noteField = [
  {
    label: "Internal note",
    key: "internalNote",
    render: (data: IClientDetails) => (
      <ClientNoteEditor
        initialValue={data.internalNote}
        clientId={data.clientId}
        fieldKey="internalNote"
      />
    ),
  },
] satisfies TInfoField<IClientDetails>[];
