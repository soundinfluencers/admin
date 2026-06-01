// export interface IInvoice {
//   invoiceId: string;
//   creationDate: string;
//   amount: number;
//   fullName: string;
//   country: string;
//   address: string;
//   campaignName: string;
//   campaignFollowers: number;
//   company: string;
//   poNumber: string;
//   vatNumber: string;
// }
//
// export interface IInvoiceResponse {
//   statusCode: number;
//   message: string;
//   data: IInvoice;
// }
//
// // Update Invoice fields
// export type TInvoiceEditableFields = Pick<
//   IInvoice,
//   "country" | "address" | "company" | "poNumber" | "vatNumber"
// >;
//
// export type TInvoiceEditableKey = keyof TInvoiceEditableFields;
//
// export type TUpdateInvoiceDto = Partial<TInvoiceEditableFields>;
//
// export type TUpdateInfluencerParams = {
//   invoiceId: string;
//   dto: TUpdateInvoiceDto;
// }
//
// export interface IUpdateInvoiceResponse {
//   statusCode: number;
//   message: string;
//   data: IInvoice;
// }
