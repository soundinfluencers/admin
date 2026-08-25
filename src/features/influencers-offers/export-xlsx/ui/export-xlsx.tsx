import React from "react";
import type { TOfferSocialMedia } from "@/features/influencers-offers/offers-filter-by-platform";
import { useExportXlsxMutation } from "@/features/influencers-offers/export-xlsx/model/use-export-xlsx-mutation.ts";
import { CircleLoader } from "@/shared/ui/circle-loader/circle-loader.tsx";

import exportIcon from '@/assets/icons/external-link.svg';

import s from './export-xlsx.module.scss';

interface ExportXlsxProps {
  isDisabled: boolean;
  platform: TOfferSocialMedia;
}

export const ExportXlsx: React.FC<ExportXlsxProps> = ({
  isDisabled,
  platform,
}) => {
  const { mutate, isPending } = useExportXlsxMutation();

  return (
    <button
     type="button"
     className={s.exportBtn}
     onClick={() => mutate(platform)}
     aria-label="Export Xlsx"
     disabled={isDisabled || isPending}
    >
      {isPending ? (
        <CircleLoader/>
      ) : (
        <img
          className={s.exportIcon}
          src={exportIcon}
          width={20}
          height={20}
          alt=""
          aria-hidden
        />
      )}
      Export .XLSX
    </button>
  );
};
