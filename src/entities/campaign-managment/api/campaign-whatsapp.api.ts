import { $api } from "@/app/api/http";

type SendWhatsAppOnePayload = {
    influencerId: string;
    accountId: string;
    socialMedia: string;
    message: string;
    clientId: string;
};

export const sendCampaignWhatsAppOne = async (
    payload: SendWhatsAppOnePayload,
) => {
    try {
        console.log("[WHATSAPP ONE REQUEST]", payload);

        const res = await $api.post("/admin/campaigns/whatsapp/one", payload);

        console.log("[WHATSAPP ONE RESPONSE]", res.data);

        return res.data?.data ?? res.data;
    } catch (error: any) {
        console.error("[WHATSAPP ONE ERROR]", {
            status: error?.response?.status,
            data: error?.response?.data,
            payload,
        });

        throw error;
    }
};