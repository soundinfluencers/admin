import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import FileUpIcon from "@/shared/assets/icons/file-up.svg?react";

import s from "./campaign-xlsx-picker.module.scss";
import { Button } from "@/shared/ui/v2/button-v2";

interface CampaignXlsxPickerProps {
  isImporting: boolean;
  onImport: (file: File) => Promise<void>;
  onClose: () => void;
}

export const CampaignXlsxPicker = ({
  isImporting,
  onImport,
  onClose,
}: CampaignXlsxPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chooseFile = () => {
    if (isImporting) return;

    inputRef.current?.click();
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0];

    event.currentTarget.value = "";

    if (!file || isImporting) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setSelectedFile(null);
      setError("Please choose a .xlsx file.");
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleImport = () => {
    if (!selectedFile || error || isImporting) return;

    void onImport(selectedFile);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        hidden
        disabled={isImporting}
        onChange={handleFileChange}
      />

      <div className={s.content} aria-busy={isImporting}>
        <div
          className={s.selectionArea}
          data-state={
            error ? "error" : isImporting ? "uploading" : "idle"
          }
        >
          <span className={s.iconContainer}>
            <FileUpIcon aria-hidden="true" />
          </span>

          <div className={s.text}>
            <p className={s.mainText}>
              {selectedFile?.name ?? "Upload XLSX file"}
            </p>

            <p className={s.supportingText}>
              {isImporting
                ? "Importing file and refreshing campaign data…"
                : selectedFile
                  ? "File selected. Click Import to continue."
                  : "Choose an .xlsx file to add placements to this campaign."}
            </p>

            {error && (
              <p className={s.errorMessage} role="alert">
                {error}
              </p>
            )}
          </div>

          <Button 
            label={selectedFile ? "Change file" : "Choose file"}
            disabled={isImporting}
            onClick={chooseFile}
          />
        </div>
      </div>

      <div className={s.actions}>
        <Button 
          label="Cancel"
          disabled={isImporting}
          onClick={onClose}
        />

        <Button
          variant="primary"
          label="Save"
          loadingLabel="Saving…"
          isLoading={isImporting}
          disabled={!selectedFile || Boolean(error) || isImporting}
          onClick={handleImport}
        />
      </div>
    </>
  );
};
