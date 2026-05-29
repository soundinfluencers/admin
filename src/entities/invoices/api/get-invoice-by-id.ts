import { $api } from "@/app/api/http.ts";
import type { IInvoiceResponse } from "@/entities/invoices/model/invoice.types.ts";

export const getInvoiceById = async (invoiceId: string) => {
  console.log(`Getting invoice with ID: ${invoiceId}`);

  const { data } = await $api.get<IInvoiceResponse>(`/invoice/${invoiceId}`);

  console.log(`Successfully retrieved invoice with ID: ${invoiceId}`, data);

  return data.data;
}
