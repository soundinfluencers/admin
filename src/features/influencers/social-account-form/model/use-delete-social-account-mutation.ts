import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSocialAccountApi, type IDeleteSocialAccountRequest } from "@/entities/influencers/social-account";
import { influencersQueryKeys } from "@/entities/influencers/api/influencers.query-keys.ts";

export const useDeleteSocialAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IDeleteSocialAccountRequest) => deleteSocialAccountApi(params),

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: influencersQueryKeys.lists(),
      });

      void queryClient.invalidateQueries({
        queryKey: influencersQueryKeys.detail(variables.influencerId),
      });
    },
  });
};
