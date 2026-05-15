import { $api } from "@/app/api/http";

export const uploadCampaignFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await $api.post("/file", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data?.data ?? res.data;
};