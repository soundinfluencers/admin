import type { GetCampaignFiltersResponseDto } from "./campaign-filter.dto";
import type {
    CampaignFilterSection,
    CampaignFiltersRequestBody,
} from "../model/campaign-filter.types";
import {
    mapCampaignFilterSectionDto,
    normalizeCampaignFilterSections,
} from "../model/campaign-filter.mappers";
import {$api} from "@/app/api/http.ts";


export const getCampaignFilters = async (
    body: CampaignFiltersRequestBody,
): Promise<CampaignFilterSection[]> => {
    const response = await $api.post<GetCampaignFiltersResponseDto>(
        "/profile/filters",
        body,
    );

    const items = response.data?.data?.filterArr;

    if (!Array.isArray(items)) {
        throw new Error("Invalid campaign filters response: filterArr is missing");
    }

    return normalizeCampaignFilterSections(
        items.map(mapCampaignFilterSectionDto),
    );
};
