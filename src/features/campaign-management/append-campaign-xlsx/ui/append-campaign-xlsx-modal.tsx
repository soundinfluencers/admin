import { Modal } from "@/shared/ui/v2/modal-v2/modal";
import { CampaignXlsxPicker } from "./campaign-xlsx-picker.tsx";

import s from "./append-campaign-xlsx-modal.module.scss";

interface AppendCampaignXlsxModalProps {
  open: boolean;
  campaignName: string;
  isImporting: boolean;
  onImport: (file: File) => Promise<void>;
  onClose: () => void;
  onCloseAutoFocus?: (event: Event) => void;
}

export const AppendCampaignXlsxModal = ({
  open,
  campaignName,
  isImporting,
  onImport,
  onClose,
  onCloseAutoFocus,
}: AppendCampaignXlsxModalProps) => {
  
  return (
    <Modal
      className={s.modal}
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isImporting) {
          onClose();
        }
      }}
      title="Import XLSX"
      description={campaignName}
      onCloseAutoFocus={onCloseAutoFocus}
    >
      {open && (
        <CampaignXlsxPicker
          isImporting={isImporting}
          onImport={onImport}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};
