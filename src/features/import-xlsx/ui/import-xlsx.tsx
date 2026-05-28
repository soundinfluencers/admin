import React from "react";
import { useDropzone } from 'react-dropzone';
import { Modal } from "@/shared/ui/modal/modal.tsx";
import { Button } from "@/shared/ui";
import { toast } from "react-toastify";

import s from './import-xlsx.module.scss'

interface ImportXlsxProps {
  onDrop: (file: File[]) => void;
  onClose: () => void;
  isPending?: boolean;
}

export const ImportXlsx: React.FC<ImportXlsxProps> = ({
  onDrop,
  onClose,
  isPending,
}) => {
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDropRejected: () => {
      toast("Please select a valid .xlsx or .xls file", {type: 'error', position: 'top-right', autoClose: 3000});
    },
    multiple: false,
    noClick: true,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    disabled: isPending,
  });

  return (
    <Modal onClose={onClose} isShownCloseButton>
      <div className={s.dropzone} {...getRootProps()}>
        <div className={s.header}>
          <h2 className={s.title}>Drag and drop your .xlsx file here</h2>
          <p className={s.description}>or</p>
        </div>

        <div className={s.cta}>
          <Button
            onClick={open}
            disabled={isPending}
            className={s.btn}
            variant={'primary'}
            size={'large'}
          >
            {isPending ? "Uploading..." : "Select file"}
          </Button>
          <input {...getInputProps()} />
        </div>
      </div>
    </Modal>
  )
};
