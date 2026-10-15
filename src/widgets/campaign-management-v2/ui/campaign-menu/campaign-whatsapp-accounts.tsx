import type { ICampaignDetails } from "@/entities/campaign/model/campaign-details.types.ts";
import {
  CAMPAIGN_WHATSAPP_VIEW_STATUS_LABELS,
  type TCampaignWhatsAppAttempts,
} from "@/features/campaign-management/send-campaign-whatsapp";

import s from "./campaign-whatsapp-accounts.module.scss";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const getAttemptDate = (
  value: string | null | undefined,
): Date | null => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

interface CampaignWhatsAppAccountsProps {
  accounts: ICampaignDetails["addedAccounts"];
  attempts: TCampaignWhatsAppAttempts;
}

export const CampaignWhatsAppAccounts = ({
  accounts,
  attempts,
}: CampaignWhatsAppAccountsProps) => {

  return (
    <div className={s.accounts}>
      {accounts.length === 0 ? (
        <p className={s.empty}>
          No accounts in this campaign.
        </p>
      ) : (
        <ul className={s.list}>
          {accounts.map((account) => {
            const phone = account.phoneNumber?.trim();
            const attemptDate = getAttemptDate(account.whatsappLastAttemptAt);
            const status = attempts[account.influencerId] ?? account.whatsappStatus;

            return (
              <li
                key={account.addedAccountsId}
                className={s.account}
              >
                <div className={s.identity}>
                  <span className={s.username}>
                    {account.username}
                  </span>

                  <span className={s.phone}>
                    {phone || "No phone number"}
                  </span>
                </div>

                <div className={s.delivery}>
                    <span
                      className={s.status}
                      data-status={status}
                      title={
                        status === "unknown"
                          ? "The send result could not be confirmed."
                          : undefined
                      }
                    >
                      {CAMPAIGN_WHATSAPP_VIEW_STATUS_LABELS[status]}
                    </span>

                  {attemptDate ? (
                    <time
                      className={s.date}
                      dateTime={attemptDate.toISOString()}
                      title="Last saved WhatsApp attempt — local time"
                    >
                      {dateFormatter.format(attemptDate)}
                    </time>
                  ) : (
                    <span className={s.date}>—</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
