import { useMutation } from "@tanstack/react-query";
import { downloadCampaignPdf } from "@/entities/campaign";
import { downloadBlobFile } from "@/shared/libs/download-blob-file.ts";
import { notifyUnhandledApiError } from "@/app/api/errors/notify";

export const useDownloadCampaignPdfMutation = () => {
  return useMutation({
    mutationFn: downloadCampaignPdf,
    retry: false,

    onSuccess: (blob, campaignId) => {
      downloadBlobFile(blob, `campaign-${campaignId}.pdf`);
    },

    onError: (error) => {
      notifyUnhandledApiError(error);
    },
  });
};
