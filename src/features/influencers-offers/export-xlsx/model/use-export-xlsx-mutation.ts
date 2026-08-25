import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { exportInfluencersOffersXlsxApi } from "@/entities/influencers-offers/api/influencers-offers.api.ts";
import type { TOfferSocialMedia } from "@/features/influencers-offers/offers-filter-by-platform";

const downloadBlobFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  try {
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export const useExportXlsxMutation = () => {
  return useMutation({
    mutationFn: async (platform: TOfferSocialMedia) => {
      const blob = await exportInfluencersOffersXlsxApi(platform);

      return { blob, platform };
    },
    onSuccess: ({ blob, platform }) => {
      downloadBlobFile(blob, `offers-${platform}.xlsx`);

      toast("Offers exported successfully", {
        type: "success",
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};
