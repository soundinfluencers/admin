import { $api } from "@/app/api/http.ts";
import type {
  IClientResponse,
  IClientsListResponse, IUpdateClientParams,
  TGetClientsParams,
} from "@/entities/client/model/client.types.ts";

export const getClients = async (params: TGetClientsParams) => {
  console.log('Getting clients...', params);

  const requestParams: Record<string, string | number> = {
    limit: params.limit,
  };

  if ("search" in params && params.search) {
    requestParams.search = params.search;
  } else if ("page" in params && params.page !== undefined) {
    requestParams.page = params.page;
  }

  const { data } = await $api.get<IClientsListResponse>('/admin/clients', {
    params: requestParams,
  });

  console.log('Successes response', data.data);

  return data.data;
}

export const getClientById = async (clientId: string) => {
  console.log('Getting client details...', clientId);

  const { data } = await $api.get<IClientResponse>(`/admin/clients/${clientId}`);

  console.log('Successes response', data.data);

  return data.data;
};

export const updateClient = async ({ clientId, dto }: IUpdateClientParams) => {
  console.log(`Updating client ${clientId} with data:`, dto);

  const { data } = await $api.patch<IClientResponse>(`/admin/clients/${clientId}`, dto);

  console.log(`Successfully updated client ${clientId}`);

  return data.data;
};

export const deleteClient = async (clientId: string) => {
  console.log(`Deleting client ${clientId}...`);

  await $api.delete(`/admin/clients/${clientId}`);

  console.log(`Successfully deleted client ${clientId}`);
};
