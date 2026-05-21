import React, { useCallback, useState } from "react";
import { useUploadInfluencersXlsxMutation } from "@/entities/influencers/api/use-upload-influencers-xlsx-mutation.ts";
import { PageLimitSelect } from "@/shared/ui";
import { SearchByQuery } from "@/features/search";
import { ImportXlsx } from "@/features/import-xlsx";
import { RefreshInfluencers } from "@/features/influencers/refresh-influencers";
import { toast } from "react-toastify";
import { ITEMS_LIMIT, type TSocialMediaValue } from "@/entities/influencers/model/influencers.constants.ts";

import plus from '@/assets/icons/plus.svg';

import s from './influencers-toolbar.module.scss';

interface InfluencersToolbarProps {
  limit: number;
  onLimitChange: (limit: number) => void;
  searchValue: string;
  onSearchChange: (searchQuery: string) => void;
  platform: TSocialMediaValue | null;
}

export const InfluencersToolbar: React.FC<InfluencersToolbarProps> = ({
  limit,
  onLimitChange,
  searchValue,
  onSearchChange,
  platform,
}) => {
  const { mutate, isPending } = useUploadInfluencersXlsxMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => {
    if (!platform) {
      toast("Please select a platform before importing xlsx.", {
        type: "warning",
        position: "top-right",
        autoClose: 3000,
      });

      return;
    }

    setIsModalOpen(true);
  }, [platform]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleUpload = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      if (!platform) {
        toast("Please select a platform before importing xlsx.", {
          type: "warning",
          position: "top-right",
          autoClose: 3000,
        });

        return;
      }

      mutate(
        {
          file,
          socialMedia: platform,
        },
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
    [platform, mutate, closeModal],
  );

  return (
    <div className={s.toolBar}>

      <div className={s.search}>
        <SearchByQuery
          value={searchValue}
          onChange={onSearchChange}
          className={s.searchInput}
        />
      </div>

      <div className={s.limit}>
        <PageLimitSelect
          value={limit}
          options={ITEMS_LIMIT}
          onValueChange={onLimitChange}
        />
      </div>

      <div className={s.actions}>
        <button
          type="button"
          onClick={handleOpenModal}
          className={s.action}
        >
          <img
            src={plus}
            className={s.icon}
            alt="Import XLSX"
            width={24}
            height={24}
          />
          Import .XLSX
        </button>

        <RefreshInfluencers className={s.action} socialMedia={platform}/>
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
