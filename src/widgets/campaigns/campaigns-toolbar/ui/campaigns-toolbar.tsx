import React, { useCallback, useState } from "react";
import { useUploadCampaignsXlsxMutation } from "@/entities/campaign/api/use-upload-campaigns-xlsx-mutation.ts";
import { Link } from "react-router-dom";
import { SearchByQuery } from "@/features/search";
import { ImportXlsx } from "@/features/import-xlsx";
import { FilterCampaignsByStatus } from "@/features/campaigns/filter-campaigns-by-status";
import { toast } from "react-toastify";
import type { TCampaignStatus } from "@/entities/campaign";

import plus from '@/assets/icons/plus.svg';

import s from './campaigns-toolbar.module.scss';

interface CampaignsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  status: TCampaignStatus | null;
  onStatusChange: (value: TCampaignStatus | null) => void;
}

export const CampaignsToolbar: React.FC<CampaignsToolbarProps> = ({
  searchValue,
  onSearchChange,
  status,
  onStatusChange,
}) => {
  const { mutate, isPending} = useUploadCampaignsXlsxMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleUpload = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      mutate(file,
        {
          onSuccess: () => {
            toast(`File "${file.name}" uploaded successfully`, {
              type: "success",
              position: "top-right",
              autoClose: 3000,
            });

            closeModal();
          },
        },
      );
    },
    [mutate, closeModal],
  );

  return (
    <div className={s.toolbar}>
      <div className={s.actions}>
        <Link to="/dashboard/create-new-campaign" className={s.action}>
          <img
            src={plus}
            alt="Add New Campaign"
            className={s.icon}
            width={16}
            height={16}
          />
          Create Campaign
        </Link>

        <button
          type={"button"}
          className={s.action}
          onClick={openModal}
        >
          <img
            src={plus}
            alt="Import .XLSX"
            className={s.icon}
            width={16}
            height={16}
          />
          Import .XLSX
        </button>
      </div>

      <div className={s.searchRow}>
        <SearchByQuery
          value={searchValue}
          onChange={onSearchChange}
          className={s.search}
        />
      </div>

      <div className={s.filtersRow}>
        <FilterCampaignsByStatus
          campaignStatus={status}
          onChange={onStatusChange}
        />
      </div>


      {isModalOpen && (
        <ImportXlsx
          onClose={closeModal}
          onDrop={handleUpload}
          isPending={isPending}
        />
      )}
    </div>
  );
};
