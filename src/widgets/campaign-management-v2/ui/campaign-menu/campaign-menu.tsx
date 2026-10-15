import clsx from "clsx";
import { useRef } from "react";
import { Sheet, type SheetProps } from "@/shared/ui/v2/sheet-v2";
import { UnsavedChangesModal } from "../unsaved-changes-modal/unsaved-changes-modal.tsx";
import { CampaignWhatsAppAccounts } from "./campaign-whatsapp-accounts.tsx";

import { WHATSAPP_STATUS } from "@/entities/campaign/model/campaign-whatsapp.types.ts";
import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";
import type { TCampaignWhatsAppAttempts } from "@/features/campaign-management/send-campaign-whatsapp";

import DownloadIcon from "@/shared/assets/icons/download.svg?react";
import PauseIcon from "@/shared/assets/icons/pause.svg?react";
import SendIcon from "@/shared/assets/icons/send.svg?react";
import CheckIcon from "@/shared/assets/icons/check-circle.svg?react";
import RefreshIcon from '@/shared/assets/icons/refresh.svg?react';

import s from "./campaign-menu.module.scss";

interface CampaignMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  accounts: ICampaignDetails["addedAccounts"];
  onCloseAutoFocus?: SheetProps["onCloseAutoFocus"];
  onDownloadPdf: () => void;
  isDownloadingPdf: boolean;
  isSaving: boolean;
  isMenuBusy: boolean;
  isSendingWhatsApp: boolean;
  whatsAppAttempts: TCampaignWhatsAppAttempts;
  isChangingCampaignStatus: boolean;
  isMenuConfirmationOpen: boolean;
  canSendWhatsApp: boolean;
  canCloseCampaign: boolean;
  canReopenCampaign: boolean;
  onCloseCampaign: () => void;
  onReopenCampaign: () => void;
  onCancelMenuAction: () => void;
  onSendWhatsApp: () => void;
  onSaveAndContinueMenuAction: () => void;
  onDiscardAndContinueMenuAction: () => void;
}

export const CampaignMenu = ({
  open,
  onOpenChange,
  campaignName,
  accounts,
  onCloseAutoFocus,
  onDownloadPdf,
  isDownloadingPdf,
  isSaving,
  isMenuBusy,
  isChangingCampaignStatus,
  isMenuConfirmationOpen,
  canCloseCampaign,
  canReopenCampaign,
  canSendWhatsApp,
  isSendingWhatsApp,
  whatsAppAttempts,
  onCloseCampaign,
  onReopenCampaign,
  onCancelMenuAction,
  onSaveAndContinueMenuAction,
  onDiscardAndContinueMenuAction,
  onSendWhatsApp,
}: CampaignMenuProps) => {
  const downloadButtonRef = useRef<HTMLButtonElement>(null);
  const actionsTitleRef = useRef<HTMLHeadingElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const sendWhatsAppButtonRef = useRef<HTMLButtonElement>(null);
  const confirmationTriggerRef = useRef<"pdf" | "status" | "whatsapp">("pdf");

  const isPdfBusy = isSaving || isDownloadingPdf;

  const counts = {
    [WHATSAPP_STATUS.SENT]: 0,
    [WHATSAPP_STATUS.NOT_SENT]: 0,
    [WHATSAPP_STATUS.FAILED]: 0,
    sending: 0,
    unknown: 0,
  };

  for (const account of accounts) {
    const status =
      whatsAppAttempts[account.influencerId] ??
      account.whatsappStatus;

    counts[status] += 1;
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && (isMenuConfirmationOpen || isChangingCampaignStatus)) {
          return;
        }

        onOpenChange(nextOpen);
      }}
      title="Campaign menu"
      description={campaignName}
      className={s.panel}
      bodyClassName={s.body}
      onCloseAutoFocus={onCloseAutoFocus}
      footer={
        canCloseCampaign || canReopenCampaign ? (
          <div className={s.footerContent}>
            <span className={s.footerLabel}>
              Campaign management
            </span>

            <button
              ref={statusButtonRef}
              type="button"
              className={clsx(
                s.button,
                canCloseCampaign ? s.dangerButton : s.primaryButton,
              )}
              disabled={isMenuBusy}
              aria-busy={isChangingCampaignStatus}
              onClick={() => {
                confirmationTriggerRef.current = "status";

                if (canCloseCampaign) {
                  onCloseCampaign();
                } else {
                  onReopenCampaign();
                }
              }}
            >
              {isChangingCampaignStatus ? (
                <span className={s.pdfLoader} aria-hidden="true" />
              ) : canCloseCampaign ? (
                <CheckIcon aria-hidden="true" className={s.icon} />
              ) : (
                <RefreshIcon aria-hidden="true" className={s.icon} />
              )}

              {canCloseCampaign
                ? isChangingCampaignStatus
                  ? "Closing…"
                  : "Close campaign"
                : isChangingCampaignStatus
                  ? "Reopening…"
                  : "Reopen campaign"}
            </button>
          </div>
        ) : undefined
      }
    >

      <section className={s.actionsSection}>
        <h3
          ref={actionsTitleRef}
          tabIndex={-1}
          className={s.sectionLabel}
        >
          Campaign actions
        </h3>

        <div className={s.actions}>
          <button
            ref={downloadButtonRef}
            type="button"
            className={s.button}
            onClick={() => {
              confirmationTriggerRef.current = "pdf";
              onDownloadPdf();
            }}
            disabled={isMenuBusy}
            aria-busy={isPdfBusy}
          >
            {isPdfBusy ? (
              <span className={s.pdfLoader} aria-hidden="true" />
            ) : (
              <DownloadIcon aria-hidden="true" className={s.icon} />
            )}
            
            {isDownloadingPdf ? "Downloading…" : "Download PDF"}
          </button>

          {!canReopenCampaign && (
            <button
              type="button"
              className={s.button}
              disabled
            >
              <PauseIcon aria-hidden="true" className={s.icon}/>
              Pause campaign
            </button>
          )}
        </div>
      </section>

      <section className={s.messagesSection}>
        <div className={s.messagesHeader}>
          <div className={s.heading}>
            <h3 className={s.messagesTitle}>
              WhatsApp messages
            </h3>

            {canSendWhatsApp && (
              <button
                ref={sendWhatsAppButtonRef}
                type="button"
                className={clsx(s.button, s.primaryButton)}
                disabled={isMenuBusy || accounts.length === 0}
                aria-busy={isSendingWhatsApp}
                onClick={() => {
                  confirmationTriggerRef.current = "whatsapp";
                  onSendWhatsApp();
                }}
              >
                {isSendingWhatsApp ? (
                  <span className={s.pdfLoader} aria-hidden="true" />
                ) : (
                  <SendIcon aria-hidden="true" className={s.icon} />
                )}

                {isSendingWhatsApp ? "Sending…" : "Send to all"}
              </button>
            )}
          </div>

          <div className={s.summary}>
            <span className={s.sentCount}>
              {counts[WHATSAPP_STATUS.SENT]} sent
            </span>
            ·
            <span>
              {counts[WHATSAPP_STATUS.NOT_SENT]} not sent
            </span>
            ·
            <span className={s.failedCount}>
              {counts[WHATSAPP_STATUS.FAILED]} failed
            </span>
            
            {counts.sending > 0 && (
              <>
                ·
                <span>{counts.sending} sending</span>
              </>
            )}
            
            {counts.unknown > 0 && (
              <>
                ·
                <span>{counts.unknown} unknown</span>
              </>
            )}

            <span>/ {accounts.length} accounts</span>
          </div>
        </div>

        <CampaignWhatsAppAccounts accounts={accounts} attempts={whatsAppAttempts}/>
      </section>

      <UnsavedChangesModal
        open={isMenuConfirmationOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onCancelMenuAction();
        }}
        onSave={onSaveAndContinueMenuAction}
        onDiscard={onDiscardAndContinueMenuAction}
        isSaving={isSaving}
        layer="above-sheet"
        onCloseAutoFocus={(event) => {
          event.preventDefault();

          const button =
            confirmationTriggerRef.current === "pdf"
              ? downloadButtonRef.current
              : confirmationTriggerRef.current === "whatsapp"
                ? sendWhatsAppButtonRef.current
                : statusButtonRef.current;

          if (button && !button.disabled) {
            button.focus();
          } else {
            actionsTitleRef.current?.focus();
          }
        }}
      />
    </Sheet>
  );
};
