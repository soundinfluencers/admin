import React from "react";

import refresh from '@/assets/icons/influencers/rotate-ccw.svg';

import s from './refresh-influencers.module.scss';
import { useScrapperUpdateMutation } from "@/entities/influencers/api/use-scrapper-upload-mutation.ts";
import { useRealtime } from "@/app/providers/realtime-provider/use-realtime.ts";
import type { TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";
import clsx from "clsx";
import { toast } from "react-toastify";

interface RefreshInfluencersProps {
  socialMedia: TSocialMediaValue | null;
  className?: string;
}

export const RefreshInfluencers: React.FC<RefreshInfluencersProps> = ({
  socialMedia,
  className,
}) => {
  const { mutate, isPending } = useScrapperUpdateMutation();

  const {
    clientId,
    isConnected,
    activeAccountAccountsUpdates,
  } = useRealtime();

  const handleRefreshInfluencersMutation = () => {
    if (!socialMedia) {
      toast("Please select a provided platform", {
        type: "warning",
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    mutate({ socialMedia });
  }

  const isUpdating = activeAccountAccountsUpdates.length > 0;

  return (
    <button
      type="button"
      onClick={handleRefreshInfluencersMutation}
      className={className}
      disabled={isPending || !clientId || !isConnected || isUpdating}
    >
      <img
        src={refresh}
        className={clsx(s.icon, {
          [s.rotate]: isPending || isUpdating,
        })}
        alt="Refresh Influencers"
        width={24}
        height={24}
      />
      Refresh
    </button>
  );
};
