

import {
    groupAccountsByInfluencer,
} from "@/widgets/campaign-management/campaign-management-table/model/whats-app.helpers";

export type WhatsAppSendStatus = "" | "SENT" | "FAILED" | "SENDING";

export type WhatsAppSendRow = {
    influencerId: string;
    phone: string;
    networks: string;
    status: WhatsAppSendStatus;
    date: string;
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
            status: "",
            date: "",
        };
    });
};