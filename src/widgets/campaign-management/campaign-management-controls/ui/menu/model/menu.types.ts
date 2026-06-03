export type WhatsAppSendStatus = "" | "SENT" | "FAILED" | "SENDING";

export type WhatsAppSendRow = {
    influencerId: string;
    phone: string;
    networks: string;
    status: WhatsAppSendStatus;
    date: string;
};