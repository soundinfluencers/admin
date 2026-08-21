export type WhatsAppSendStatus = "NOT SENT" | "SENT" | "FAILED" | "SENDING";

export type WhatsAppSendRow = {
    influencerId: string;
    phone: string;
    networks: string;
    status: WhatsAppSendStatus;
    date: string;
};
