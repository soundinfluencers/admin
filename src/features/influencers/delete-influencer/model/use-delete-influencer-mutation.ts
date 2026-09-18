import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInfluencerById } from "@/entities/influencers/api/influencers.api.ts";
import { influencersQueryKeys } from "@/entities/influencers/api/influencers.query-keys.ts";

export const useDeleteInfluencerMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteInfluencerById,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: influencersQueryKeys.lists(),
      });

      navigate(-1);
    },
  });
};
