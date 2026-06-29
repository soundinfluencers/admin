import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSocialAccountApi } from "@/entities/influencers/social-account";
import { influencersQueryKeys } from "@/entities/influencers/api/influencers.query-keys.ts";
import type { IInfluencerDetails } from "@/entities/influencers/model/influencers.types.ts";

export const useCreateSocialAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSocialAccountApi,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        influencersQueryKeys.detail(variables.influencerId),
        (oldData: IInfluencerDetails | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            [variables.socialMedia]: data[variables.socialMedia],
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: influencersQueryKeys.lists(),
      });
    },
  });
};
