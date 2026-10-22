import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import { markPromoAsPaid } from "@/entities/campaign";
import { toast } from "react-toastify";

import { IconButton } from "@/shared/ui/v2/icon-button";

import type {
  ICampaignDetails,
  IMarkPromoPaidResponse,
} from "@/entities/campaign/model/campaign-details.types.ts";

import CheckIcon from "@/shared/assets/icons/check.svg?react";

import s from './mark-promo-as-paid.module.scss';

interface MarkPromoAsPaidProps {
  campaignId: string;
  promoId: string;
  closePromo: ICampaignDetails["addedAccounts"][number]["closePromo"];
  canMarkAsPaid: boolean;
  isActionBlocked?: () => boolean;
  onPaid: (result: IMarkPromoPaidResponse["data"]) => void | Promise<void>;
}

export const MarkPromoAsPaid = ({
  campaignId,
  promoId,
  closePromo,
  canMarkAsPaid,
  isActionBlocked,
  onPaid,
}: MarkPromoAsPaidProps) => {
  const queryClient = useQueryClient();
  const mutationKey = ["campaigns", "mark-promo-as-paid", { campaignId, promoId }] as const;
  const mutationFilters = { mutationKey, exact: true };
  const isPending = useIsMutating(mutationFilters) > 0;

  const { mutate } = useMutation({
    mutationKey,
    mutationFn: markPromoAsPaid,
    onSuccess: async (result) => {
      await onPaid(result);

      toast("Promo marked as paid", {
        type: "success",
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
  
  const isPaid = closePromo === "close";

  const isDisabled =
    !canMarkAsPaid ||
    isPaid ||
    isPending;

  const handleClick = () => {
    if (isActionBlocked?.()) return;
    if (isDisabled || queryClient.isMutating(mutationFilters) > 0) return;

    mutate({ campaignId, promoId });
  };

  return (
    <IconButton
      className={s.button}
      icon={isPaid ? CheckIcon : undefined}
      aria-label={isPaid ? "Promo paid" : "Mark promo as paid"}
      disabled={isDisabled}
      isLoading={isPending}
      onClick={handleClick}
      data-paid={isPaid}
    />
  );
};
