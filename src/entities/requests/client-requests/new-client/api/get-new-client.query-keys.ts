export const newClientQueryKeys = {
  all: ['new-client'] as const,

  details: () => [...newClientQueryKeys.all, 'detail'] as const,

  detail: (requestId?: string) =>
    [...newClientQueryKeys.details(), requestId] as const,
};
