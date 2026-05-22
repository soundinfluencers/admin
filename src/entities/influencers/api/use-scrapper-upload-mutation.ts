import { useMutation } from "@tanstack/react-query";
import { scrapperUploadInfluencer } from "@/entities/influencers/api/influencers.api.ts";
import { useRealtime } from "@/app/providers/realtime-provider/use-realtime.ts";
import { toast } from "react-toastify";
import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

type TScrapperUpdateMutationParams = {
  socialMedia: TSocialMediaValue;
};

export const useScrapperUpdateMutation = () => {
  // const queryClient = useQueryClient();
  const { clientId, isConnected } = useRealtime();

  return useMutation({
    mutationFn: async ({ socialMedia }: TScrapperUpdateMutationParams) => {
      if (!clientId) {
        throw new Error("Realtime clientId is not ready");
      }

      if (!isConnected) {
        throw new Error("Realtime connection is not ready");
      }

      return scrapperUploadInfluencer({
        socialMedia,
        clientId,
      });
    },

    onMutate: ({ socialMedia }) => {
      toast.info(`${socialMedia} accounts update started`, {
        toastId: `scrapper-accounts-started:${socialMedia}`,
      });
    },

    onError: (_error, variables) => {
      toast.dismiss(`scrapper-accounts-started:${variables.socialMedia}`);

      toast.error("Failed to start accounts update", {
        toastId: `scrapper-accounts-start-failed:${variables.socialMedia}`,
      });
    },
  });
};
