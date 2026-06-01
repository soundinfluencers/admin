export const clientsInvoicesQueryKeys = {
  all: ["clients-invoices"] as const,
  lists: () => [...clientsInvoicesQueryKeys.all, "list"] as const,
  list: <T>(params: T) => [...clientsInvoicesQueryKeys.lists(), params] as const,
};
