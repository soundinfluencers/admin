import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSocialAccountApi } from "@/entities/influencers/social-account";
import { influencersQueryKeys } from "@/entities/influencers/api/influencers.query-keys.ts";

export const useUpdateSocialAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSocialAccountApi,
    onSuccess: (variables) => {
      void queryClient.invalidateQueries({
        queryKey: influencersQueryKeys.lists(),
      });

      void queryClient.invalidateQueries({
        queryKey: influencersQueryKeys.detail(variables.influencerId),
      });
    },
  });
};
