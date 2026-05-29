export const influencersInvoicesQueryKeys = {
  all: ["influencers-invoices"] as const,
  lists: () => [...influencersInvoicesQueryKeys.all, "list"] as const,
  list: <T>(params: T) => [...influencersInvoicesQueryKeys.lists(), params] as const,
};
