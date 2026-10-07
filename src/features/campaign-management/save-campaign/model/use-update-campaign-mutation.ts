import { useMutation } from "@tanstack/react-query";
import { updateCampaignById } from "@/entities/campaign";

export const useUpdateCampaignMutation = () => {
  return useMutation({
    mutationFn: updateCampaignById,
    retry: false,
  });
};
