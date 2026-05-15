import {$api} from "@/app/api/http.ts";


export const createAdminCampaign = async (payload: Record<string, unknown>) => {
    return $api.post("/proposal-system", payload);
};