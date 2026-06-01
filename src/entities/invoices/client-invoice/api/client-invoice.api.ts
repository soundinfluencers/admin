import { $api } from "@/app/api/http.ts";
import type {
  IClientsInvoicesListResponse,
  IUpdateClientInvoiceRequest, IUpdateClientInvoiceResponse,
  TGetClientsInvoicesParams,
} from "@/entities/invoices/client-invoice/model/client-invoice.types.ts";

export const getClientsInvoices = async (params: TGetClientsInvoicesParams) => {
  console.log("Get Clients Invoices", params);

  const { data } = await $api.get<IClientsInvoicesListResponse>('/admin/invoices/client', {
    params,
  });

  console.log('Successfully get Clients Invoices', data);

  return data.data;
}

export const updateClientInvoice = async ({
  invoiceId,
  dto,
}: IUpdateClientInvoiceRequest) => {
  console.log(`Updating invoice with ID: ${invoiceId} with data:`, dto);

  const { data } = await $api.patch<IUpdateClientInvoiceResponse>(`/invoice/${invoiceId}`, dto);

  console.log('Successfully updated invoice', data);

  return data.data;
}
