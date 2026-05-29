export interface IInvoice {
  invoiceId: string;
  creationDate: string;
  amount: number;
  fullName: string;
  country: string;
  address: string;
  campaignName: string;
  campaignFollowers: number;
  company: string;
  poNumber: string;
  vatNumber: string;
}

export interface IInvoiceResponse {
  statusCode: number;
  message: string;
  data: IInvoice;
}
