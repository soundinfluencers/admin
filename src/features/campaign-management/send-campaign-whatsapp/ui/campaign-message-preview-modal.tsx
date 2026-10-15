import { Fragment, useState, type ComponentProps } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";

import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard";
import { Modal } from "@/shared/ui/v2/modal-v2/modal";
import { Spinner } from "@/shared/ui/v2/spinner";

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

const MessageText = ({ text }: { text: string }) => (
  <>
    {text.split(/(https?:\/\/\S+)/gi).map((part, index) =>
      /^https?:\/\//i.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    )}
  </>
);

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
  const [copiedChannel, setCopiedChannel] =
    useState<"whatsapp" | "email" | null>(null);
  
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
    setCopiedChannel(null);

    const success = await copyToClipboard(
      preview.request.message,
    );

    if (success) {
      setCopiedChannel("whatsapp");
    } else {
      toast.error("Could not copy the message.");
    }
  };

  const copyEmail = async () => {
    setCopiedChannel(null);

    const { text, html } = formatCampaignEmailMessage(
      preview.data,
    );

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

        setCopiedChannel("email");
        return;
      } catch {
        // try to copy regular text.
      }
    }

    try {
      const success = await copyToClipboard(text);

      if (success) {
        setCopiedChannel("email");
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
        <div className={s.preview}>
          {blocks.map((block, index) => {
            if (block.type === "placement") {
              return (
                <dl
                  key={block.addedAccountsId}
                  className={s.placement}
                >
                  {block.fields.map(([label, value]) => (
                    <Fragment key={label}>
                      <dt className={s.label}>{label}</dt>

                      <dd className={s.value}>
                        <MessageText text={value} />
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              );
            }

            if (block.type === "heading") {
              return (
                <h3 key={`text-${index}`} className={s.heading}>
                  {block.text}
                </h3>
              );
            }

            return (
              <p key={`text-${index}`} className={s.text}>
                <MessageText text={block.text} />
              </p>
            );
          })}
        </div>
      </div>

      <div className={s.footer}>
        <div className={s.actionGroup}>
          <button
            type="button"
            className={clsx(s.button, s.copyWhatsAppButton)}
            onClick={() => {
              void copyWhatsApp();
            }}
          >
            <CopyIcon className={s.icon} aria-hidden="true" />
            {copiedChannel === "whatsapp" ? "Copied" : "Copy WhatsApp"}
          </button>

          <button
            type="button"
            className={clsx(s.button, s.copyEmailButton)}
            onClick={() => {
              void copyEmail();
            }}
          >
            <CopyIcon className={s.icon} aria-hidden="true" />
            {copiedChannel === "email" ? "Copied" : "Copy Email"}
          </button>
        </div>

        <div className={s.actionGroup}>
          <button
            type="button"
            className={s.button}
            disabled={isBusy}
            aria-busy={isSendingEmail}
            onClick={onSendEmail}
          >
            {isSendingEmail ? (
              <Spinner/>
            ) : (
              <SendIcon className={s.icon} aria-hidden="true" />
            )}
            {isSendingEmail ? "Sending…" : "Send Email"}
          </button>

          <button
            type="button"
            className={clsx(s.button, s.primaryButton)}
            disabled={isBusy}
            aria-busy={isSending}
            onClick={onSendWhatsApp}
          >
            {isSending ? (
              <Spinner/>
            ) : (
              <SendIcon className={s.icon} aria-hidden="true" />
            )}

            {isSending ? "Sending…" : "Send WhatsApp"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
