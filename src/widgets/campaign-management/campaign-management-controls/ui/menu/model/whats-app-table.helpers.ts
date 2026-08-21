

import {
    groupAccountsByInfluencer,
} from "@/widgets/campaign-management/campaign-management-table/model/whats-app.helpers";
import type {
    WhatsAppSendRow,
    WhatsAppSendStatus,
} from "@/widgets/campaign-management/campaign-management-controls/ui/menu/model/menu.types.ts";

const toWhatsAppSendStatus = (status: unknown): WhatsAppSendStatus => {
    switch (String(status ?? "").toLowerCase()) {
        case "sent":
            return "SENT";
        case "failed":
            return "FAILED";
        default:
            return "NOT SENT";
    }
};

const formatWhatsAppDate = (value: unknown): string => {
    if (!value) return "";

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
};

type BuildInitialWhatsAppRowsParams = {
    accounts: any[];
};

export const buildInitialWhatsAppRows = ({
                                             accounts,
                                         }: BuildInitialWhatsAppRowsParams): WhatsAppSendRow[] => {
    const accountsByInfluencer = groupAccountsByInfluencer(accounts ?? []);

    return Object.values(accountsByInfluencer).map((influencerAccounts: any[]) => {
        const firstAccount = influencerAccounts[0];

        return {
            influencerId: String(firstAccount?.influencerId ?? ""),
            phone: String(firstAccount?.phoneNumber ?? ""),
            networks: influencerAccounts
                .map((account) => account.username)
                .filter(Boolean)
                .join(", "),
            status: toWhatsAppSendStatus(firstAccount?.whatsappStatus),
            date: formatWhatsAppDate(firstAccount?.whatsappLastAttemptAt),
        };
    });
};
