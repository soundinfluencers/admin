export const negotiateQueryKeys = {
  all: ['negotiate-details'] as const,

  details: () => [...negotiateQueryKeys.all, 'detail'] as const,

  detail: (requestId: string) => [...negotiateQueryKeys.details(), requestId] as const,
};
