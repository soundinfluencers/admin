import { useEffect, useRef, useState, type ComponentProps } from "react";
import { toast } from "react-toastify";

import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard";
import { Modal } from "@/shared/ui/v2/modal-v2/modal";
import { Button } from "@/shared/ui/v2/button-v2";
import { CampaignMessagePreviewContent } from "./campaign-message-preview-content.tsx";

import {
  getCampaignWhatsAppMessageBlocks,
  formatCampaignEmailMessage
} from "../model/campaign-whatsapp-message";

import type {
  CampaignWhatsAppPreview,
} from "../model/build-campaign-whatsapp-requests";

import SendIcon from "@/shared/assets/icons/send.svg?react";
import CopyIcon from "@/shared/assets/icons/copy.svg?react";

import s from "./campaign-message-preview-modal.module.scss";

interface CampaignMessagePreviewModalProps {
  preview: CampaignWhatsAppPreview;
  isSending: boolean;
  onClose: () => void;
  onSendWhatsApp: () => void;
  isSendingEmail: boolean;
  onSendEmail: () => void;
  onCloseAutoFocus?: ComponentProps<typeof Modal>["onCloseAutoFocus"];
}

export const CampaignMessagePreviewModal = ({
  preview,
  isSending,
  onClose,
  onSendWhatsApp,
  onCloseAutoFocus,
  isSendingEmail,
  onSendEmail,
}: CampaignMessagePreviewModalProps) => {
  const [copiedChannel, setCopiedChannel] = useState<"whatsapp" | "email" | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopiedTimeout = () => {
    if (copiedTimeoutRef.current !== null) {
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = null;
    }
  };

  const showCopied = (channel: "whatsapp" | "email") => {
    clearCopiedTimeout();
    setCopiedChannel(channel);

    copiedTimeoutRef.current = setTimeout(() => {
      copiedTimeoutRef.current = null;
      setCopiedChannel(null);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);
  
  const copyToClipboard = useCopyToClipboard();

  const blocks = getCampaignWhatsAppMessageBlocks(preview.data);
  const placementCount = preview.data.placements.length;

  const description = [
    preview.data.recipientName,
    `${placementCount} ${
      placementCount === 1 ? "placement" : "placements"
    }`,
  ]
  .filter(Boolean)
  .join(" · ");

  const copyWhatsApp = async () => {
    clearCopiedTimeout();
    setCopiedChannel(null);

    const success = await copyToClipboard(preview.request.message);

    if (success) {
      showCopied("whatsapp");
    } else {
      toast.error("Could not copy the message.");
    }
  };

  const copyEmail = async () => {
    clearCopiedTimeout();
    setCopiedChannel(null);

    const { text, html } = formatCampaignEmailMessage(preview.data);

    if (
      typeof ClipboardItem !== "undefined" &&
      typeof navigator.clipboard?.write === "function"
    ) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob(
              [html],
              { type: "text/html" },
            ),
            "text/plain": new Blob(
              [text],
              { type: "text/plain" },
            ),
          }),
        ]);

        showCopied("email");

        return;
      } catch {
        // try to copy regular text.
      }
    }

    try {
      const success = await copyToClipboard(text);

      if (success) {
        showCopied("email");
        toast.info("Message copied without formatting.");
      } else {
        toast.error("Could not copy the message.");
      }
    } catch {
      toast.error("Could not copy the message.");
    }
  };

  const isBusy = isSending || isSendingEmail;

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open && !isBusy) onClose();
      }}
      title="Send message"
      description={description}
      className={s.modal}
      onCloseAutoFocus={onCloseAutoFocus}
    >
      
      <div className={s.scrollArea}>
        <CampaignMessagePreviewContent blocks={blocks} />
      </div>

      <div className={s.footer}>
        <div className={s.actionGroup}>
          <Button 
            label={copiedChannel === "whatsapp" ? "Copied" : "Copy WhatsApp"}
            reserveLabel="Copy WhatsApp"
            icon={CopyIcon}
            onClick={() => void copyWhatsApp()}
          />
          
          <Button
            label={copiedChannel === "email" ? "Copied" : "Copy Email"}
            reserveLabel="Copy Email"
            icon={CopyIcon}
            onClick={() => void copyEmail()}
          />
        </div>

        <div className={s.actionGroup}>
          <Button 
            label="Send Email"
            loadingLabel="Sending…"
            icon={SendIcon}
            isLoading={isSendingEmail}
            disabled={isBusy}
            onClick={onSendEmail}
          />
          
          <Button
            variant="primary"
            label="Send WhatsApp"
            loadingLabel="Sending…"
            icon={SendIcon}
            isLoading={isSending}
            disabled={isBusy}
            onClick={onSendWhatsApp}
          />
        </div>
      </div>
    </Modal>
  );
};
