export const invoiceQueryKeys = {
  all: ["invoice"] as const,
  details: () => [...invoiceQueryKeys.all, "detail"] as const,
  detail: (invoiceId: string) => [...invoiceQueryKeys.details(), invoiceId] as const,
};
