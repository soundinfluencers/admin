import type { PromoAccount } from "./promo-account.types";
import type { PromoAccountDto, PromoAccountCountryDto } from "../api/promo-account.dto";

const mapCountry = (item: PromoAccountCountryDto) => {
    if (typeof item === "string") {
        return {
            country: item,
            percentage: 0,
        };
    }

    return {
        country: String(item.country ?? ""),
        percentage: Number(item.percentage ?? 0),
    };
};

export const mapPromoAccountDto = (dto: PromoAccountDto): PromoAccount => {
    return {
        accountId: String(dto.accountId ?? ""),
        influencerId: String(dto.influencerId ?? ""),
        username: String(dto.username ?? ""),
        logoUrl: String(dto.logoUrl ?? ""),
        followers: Number(dto.followers ?? 0),
        prices: dto.prices ?? {},
        socialMedia: String(dto.socialMedia ?? ""),
        profileType: dto.profileType ?? "community",
        countries: (dto.countries ?? []).map(mapCountry),
        averageViews: Number(dto.averageViews ?? 0),
        engagementRate: Number(dto.engagementRate ?? 0),
        musicGenres: dto.musicGenres ?? [],
        creatorCategories: dto.creatorCategories ?? [],
        categories: dto.categories ?? [],
    };
};