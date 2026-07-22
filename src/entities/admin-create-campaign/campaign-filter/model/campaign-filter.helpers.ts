import type {
    CampaignFilterItem,
    CampaignFilterMethod,
    CampaignFilterSection,
    PromoAccountsFiltersBody,
    CampaignFiltersRequestBody,
} from "./campaign-filter.types";

export const getEmptyCampaignFiltersBody = (): CampaignFiltersRequestBody => ({
    socialMedias: [],
    profileTypes: [],
    communityMusicGenres: [],
    creatorMusicGenres: [],
    musicGenresFilterMethod: "or",
    countries: [],
    communityThemeTopics: [],
    creatorContentFocus: [],
    musicCategories: [],
    entertainmentCategories: [],
});

export const flattenCampaignFilterTree = (
    items: CampaignFilterItem[],
): CampaignFilterItem[] =>
    items.flatMap((item) => [
        item,
        ...(item.children ? flattenCampaignFilterTree(item.children) : []),
    ]);

export const flattenCampaignFilterSections = (
    sections: CampaignFilterSection[],
): CampaignFilterItem[] =>
    sections.flatMap((section) => flattenCampaignFilterTree(section.filters));

export const buildSelectedCampaignFilters = (
    sections: CampaignFilterSection[],
    selectedIds: string[],
): CampaignFilterItem[] => {
    const map = new Map(
        flattenCampaignFilterSections(sections).map((item) => [item.id, item] as const),
    );

    return selectedIds
        .map((id) => map.get(id))
        .filter(Boolean) as CampaignFilterItem[];
};

export const findCampaignFilterParent = (
    filters: CampaignFilterItem[],
    childId: string,
): CampaignFilterItem | null => {
    for (const item of filters) {
        if (item.children?.some((child) => child.id === childId)) {
            return item;
        }

        if (item.children?.length) {
            const nested = findCampaignFilterParent(item.children, childId);
            if (nested) return nested;
        }
    }

    return null;
};

const collectDeepIds = (node: CampaignFilterItem): string[] => [
    node.id,
    ...(node.children?.flatMap((child) => collectDeepIds(child)) ?? []),
];

export const toggleCampaignFilterSelection = ({
                                                  selectedIds,
                                                  item,
                                                  checked,
                                                  sectionFilters,
                                              }: {
    selectedIds: string[];
    item: CampaignFilterItem;
    checked: boolean;
    sectionFilters: CampaignFilterItem[];
}) => {
    const next = new Set(selectedIds);
    const parent = findCampaignFilterParent(sectionFilters, item.id);

    if (checked) {
        if (item.children?.length) {
            if (item.selectionMode === "children-only") {
                next.delete(item.id);
            }

            const ids = item.selectionMode === "children-only"
                ? item.children.flatMap((child) => collectDeepIds(child))
                : collectDeepIds(item);

            ids.forEach((id) => next.add(id));
        } else if (parent) {
            if (parent.selectionMode !== "children-only") {
                next.add(parent.id);
            }
            next.add(item.id);
        } else {
            next.add(item.id);
        }

        return Array.from(next);
    }

    if (item.children?.length) {
        next.delete(item.id);

        const ids = item.selectionMode === "children-only"
            ? item.children.flatMap((child) => collectDeepIds(child))
            : collectDeepIds(item);

        ids.forEach((id) => next.delete(id));
        return Array.from(next);
    }

    next.delete(item.id);

    if (parent) {
        const siblingIds = parent.children?.map((child) => child.id) ?? [];
        const hasSelectedSibling = siblingIds.some(
            (id) => id !== item.id && next.has(id),
        );

        if (!hasSelectedSibling && parent.selectionMode !== "children-only") {
            next.delete(parent.id);
        }
    }

    return Array.from(next);
};

const normalize = (value: string) => value.trim().toLowerCase();

export const getDefaultSocialFilterIds = (
    sections: CampaignFilterSection[],
): string[] => {
    const socialItems = flattenCampaignFilterSections(sections).filter(
        (item) => item.group === "socialMedia" && !item.children?.length,
    );

    const instagram = socialItems.find((item) => {
        const id = normalize(item.id);
        const label = normalize(item.filterName);
        return id === "instagram" || label === "instagram";
    });

    const tiktok = socialItems.find((item) => {
        const id = normalize(item.id);
        const label = normalize(item.filterName);
        return (
            id === "tiktok" ||
            label === "tiktok" ||
            id.includes("tiktok") ||
            label.includes("tiktok")
        );
    });

    return [instagram?.id, tiktok?.id].filter(Boolean) as string[];
};

const findSelectedItemsByGroup = (
    sections: CampaignFilterSection[],
    selectedIds: string[],
    group: string,
): CampaignFilterItem[] => {
    return buildSelectedCampaignFilters(sections, selectedIds).filter(
        (item) => item.group === group,
    );
};

const findSelectedLeafItemsByGroup = (
    sections: CampaignFilterSection[],
    selectedIds: string[],
    group: string,
): CampaignFilterItem[] => {
    return findSelectedItemsByGroup(sections, selectedIds, group).filter(
        (item) => !item.children?.length,
    );
};

export const buildCampaignFiltersRequestBody = ({
                                                    sections,
                                                    selectedIds,
                                                    musicGenresFilterMethod,
                                                }: {
    sections: CampaignFilterSection[];
    selectedIds: string[];
    musicGenresFilterMethod: CampaignFilterMethod;
}): CampaignFiltersRequestBody => {
    const socialMedias = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "socialMedia",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const profileTypes = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "profileType",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const selectedItems = buildSelectedCampaignFilters(sections, selectedIds);
    const getBackendValues = (
        group:
            | "communityMusicGenres"
            | "creatorMusicGenres"
            | "communityThemeTopics"
            | "creatorContentFocus",
    ): string[] =>
        Array.from(
            new Set(
                selectedItems
                    .map((item) => item.backendValues?.[group])
                    .filter((value): value is string => Boolean(value)),
            ),
        );

    const communityMusicGenres = getBackendValues("communityMusicGenres");
    const creatorMusicGenres = getBackendValues("creatorMusicGenres");

    const countries = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "countries",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const communityThemeTopics = getBackendValues("communityThemeTopics");
    const creatorContentFocus = getBackendValues("creatorContentFocus");

    const musicCategories = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "musicCategories",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    const entertainmentCategories = findSelectedLeafItemsByGroup(
        sections,
        selectedIds,
        "entertainmentCategories",
    ).map((item) => item.apiValue || item.rawId || item.filterName);

    return {
        socialMedias,
        profileTypes,
        communityMusicGenres,
        creatorMusicGenres,
        musicGenresFilterMethod,
        countries,
        communityThemeTopics,
        creatorContentFocus,
        musicCategories,
        entertainmentCategories,
    };
};

export const buildPromoAccountsFiltersBody = ({
                                                  sections,
                                                  selectedIds,
                                                  musicGenresFilterMethod,
                                                  budget,
                                                  budgetCurrency,
                                              }: {
    sections: CampaignFilterSection[];
    selectedIds: string[];
    musicGenresFilterMethod: CampaignFilterMethod;
    budget: number | null;
    budgetCurrency: string;
}): PromoAccountsFiltersBody => {
    const base = buildCampaignFiltersRequestBody({
        sections,
        selectedIds,
        musicGenresFilterMethod,
    });
    return {
        ...base,
        ...(budget && budget > 0
            ? {
                budget,
                budgetCurrency,
            }
            : {}),
    };
};
