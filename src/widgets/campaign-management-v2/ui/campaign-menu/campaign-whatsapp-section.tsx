import type { Ref } from "react";
import { Button } from "@/shared/ui/v2/button-v2";
import { CampaignWhatsAppAccounts } from "./campaign-whatsapp-accounts.tsx";

import { WHATSAPP_STATUS } from "@/entities/campaign/model/campaign-whatsapp.types.ts";
import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";
import type { TCampaignWhatsAppAttempts } from "@/features/campaign-management/send-campaign-whatsapp";

import SendIcon from "@/shared/assets/icons/send.svg?react";

import s from "./campaign-whatsapp-section.module.scss";

interface CampaignWhatsAppSectionProps {
  accounts: ICampaignDetails["addedAccounts"];
  whatsAppAttempts: TCampaignWhatsAppAttempts;
  canSendWhatsApp: boolean;
  isSendingWhatsApp: boolean;
  isMenuBusy: boolean;
  onSendWhatsApp: () => void;
  sendWhatsAppButtonRef: Ref<HTMLButtonElement>;
}

export const CampaignWhatsAppSection = ({
  accounts,
  whatsAppAttempts,
  canSendWhatsApp,
  isSendingWhatsApp,
  isMenuBusy,
  onSendWhatsApp,
  sendWhatsAppButtonRef,
}: CampaignWhatsAppSectionProps) => {
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
    <section className={s.messagesSection}>
      <div className={s.messagesHeader}>
        <div className={s.heading}>
          <h3 className={s.messagesTitle}>
            WhatsApp messages
          </h3>

          {canSendWhatsApp && (
            <Button
              ref={sendWhatsAppButtonRef}
              variant="primary"
              label="Send to all"
              loadingLabel="Sending…"
              isLoading={isSendingWhatsApp}
              icon={SendIcon}
              disabled={isMenuBusy || accounts.length === 0}
              onClick={onSendWhatsApp}
            />
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
  );
};
