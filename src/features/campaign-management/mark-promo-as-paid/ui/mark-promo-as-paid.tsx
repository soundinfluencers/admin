import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import { markPromoAsPaid } from "@/entities/campaign";
import { toast } from "react-toastify";

import type {
  ICampaignDetails,
  IMarkPromoPaidResponse,
} from "@/entities/campaign/model/campaign-details.types.ts";

import CircleLoaderIcon from "@/shared/assets/icons/loader-circle.svg?react";
import CheckIcon from "@/shared/assets/icons/check.svg?react";

import s from './mark-promo-as-paid.module.scss';

interface MarkPromoAsPaidProps {
  campaignId: string;
  promoId: string;
  closePromo: ICampaignDetails["addedAccounts"][number]["closePromo"];
  canMarkAsPaid: boolean;
  onPaid: (result: IMarkPromoPaidResponse["data"]) => void | Promise<void>;
}

export const MarkPromoAsPaid = ({
  campaignId,
  promoId,
  closePromo,
  canMarkAsPaid,
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
    if (isDisabled || queryClient.isMutating(mutationFilters) > 0) return;

    mutate({ campaignId, promoId });
  };

  return (
    <div
      className={s.root}
      aria-busy={isPending}
    >
      {isPending ? (
        <span
          className={s.indicator}
          role="status"
          aria-label="Closing promo"
        >
          <CircleLoaderIcon
            className={s.loader}
            aria-hidden="true"
            focusable="false"
          />
        </span>
      ) : (
        <button
          type="button"
          className={s.button}
          onClick={handleClick}
          disabled={isDisabled}
          data-paid={isPaid}
          aria-label={isPaid ? "Promo paid" : "Mark promo as paid"}
        >
          {isPaid && <CheckIcon aria-hidden="true" focusable="false" />}
        </button>
      )}
    </div>
  );
};
