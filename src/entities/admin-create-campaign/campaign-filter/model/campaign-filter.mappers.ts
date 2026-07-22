import type {
    CampaignBackendFilterGroup,
    CampaignFilterItem,
    CampaignFilterMethod,
    CampaignFilterSection,
} from "./campaign-filter.types";
import type {
    CampaignFilterItemDto,
    CampaignFilterSectionDto,
} from "../api/campaign-filter.dto";
import {
    UNIFIED_ADDITIONAL_TOPICS,
    UNIFIED_MUSIC_GENRES,
    type UnifiedFilterConfig,
} from "./campaign-filter.config";

const COMMUNITY_MUSIC_GROUP: CampaignBackendFilterGroup =
    "communityMusicGenres";
const CREATOR_MUSIC_GROUP: CampaignBackendFilterGroup = "creatorMusicGenres";
const COMMUNITY_TOPICS_GROUP: CampaignBackendFilterGroup =
    "communityThemeTopics";
const CREATOR_TOPICS_GROUP: CampaignBackendFilterGroup = "creatorContentFocus";

const MUSIC_GROUPS = new Set<string>([
    COMMUNITY_MUSIC_GROUP,
    CREATOR_MUSIC_GROUP,
]);
const TOPICS_GROUPS = new Set<string>([
    COMMUNITY_TOPICS_GROUP,
    CREATOR_TOPICS_GROUP,
]);

const mapMethod = (value: string): CampaignFilterMethod | null => {
    const normalized = value.toLowerCase();

    if (normalized === "and") return "and";
    if (normalized === "or") return "or";

    return null;
};

const toSafeFilterId = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[()]/g, "")
        .replace(/,/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export const mapCampaignFilterItemDto = (
    dto: CampaignFilterItemDto,
): CampaignFilterItem => {
    const raw = String(dto.id ?? "");

    return {
        id: toSafeFilterId(raw),
        rawId: raw,
        apiValue: raw,
        group: String(dto.group ?? ""),
        filterName: String(dto.filterName ?? ""),
        count: Number(dto.count ?? 0),
        children: dto.children?.map(mapCampaignFilterItemDto),
    };
};

export const mapCampaignFilterSectionDto = (
    dto: CampaignFilterSectionDto,
): CampaignFilterSection => ({
    id: String(dto.id),
    title: String(dto.title),
    methods: (dto.AndOrFlag ?? [])
        .map((item) => mapMethod(item.method))
        .filter(Boolean) as CampaignFilterMethod[],
    filters: (dto.filters ?? []).map(mapCampaignFilterItemDto),
});

const flattenItems = (items: CampaignFilterItem[]): CampaignFilterItem[] =>
    items.flatMap((item) => [
        item,
        ...(item.children?.length ? flattenItems(item.children) : []),
    ]);

const getSectionGroups = (section: CampaignFilterSection): Set<string> =>
    new Set(flattenItems(section.filters).map((item) => item.group));

const isSectionForGroups = (
    section: CampaignFilterSection,
    groups: Set<string>,
) => Array.from(getSectionGroups(section)).some((group) => groups.has(group));

const getItemsByGroupAndId = (
    sections: CampaignFilterSection[],
): Map<string, CampaignFilterItem> => {
    const result = new Map<string, CampaignFilterItem>();

    sections.forEach((section) => {
        flattenItems(section.filters).forEach((item) => {
            const rawId = item.rawId || item.apiValue;
            result.set(`${item.group}:${rawId}`, item);
        });
    });

    return result;
};

const getMappedItem = (
    config: UnifiedFilterConfig,
    itemsByGroupAndId: Map<string, CampaignFilterItem>,
    communityGroup: CampaignBackendFilterGroup,
    creatorGroup: CampaignBackendFilterGroup,
    uiGroup: string,
): CampaignFilterItem => {
    const communityItem = config.communityId
        ? itemsByGroupAndId.get(`${communityGroup}:${config.communityId}`)
        : undefined;
    const creatorItem = config.creatorId
        ? itemsByGroupAndId.get(`${creatorGroup}:${config.creatorId}`)
        : undefined;

    const backendValues: CampaignFilterItem["backendValues"] = {};

    if (config.communityId) {
        backendValues[communityGroup] = config.communityId;
    }

    if (config.creatorId) {
        backendValues[creatorGroup] = config.creatorId;
    }

    return {
        id: config.key,
        rawId: config.key,
        apiValue: config.key,
        group: uiGroup,
        filterName: config.label,
        count: (communityItem?.count ?? 0) + (creatorItem?.count ?? 0),
        backendValues,
    };
};

const getUnmappedItems = ({
    sections,
    groups,
    knownIds,
    uiGroup,
}: {
    sections: CampaignFilterSection[];
    groups: Set<string>;
    knownIds: Set<string>;
    uiGroup: string;
}): CampaignFilterItem[] => {
    return sections.flatMap((section) =>
        flattenItems(section.filters)
            .filter((item) => {
                const rawId = item.rawId || item.apiValue;
                return groups.has(item.group) && !knownIds.has(`${item.group}:${rawId}`);
            })
            .map((item) => ({
                ...item,
                id: `${uiGroup}-${item.group}-${item.id}`,
                group: uiGroup,
                children: undefined,
                backendValues: {
                    [item.group]: item.apiValue || item.rawId,
                },
            })),
    );
};

const collectMethods = (
    sections: CampaignFilterSection[],
): CampaignFilterMethod[] =>
    Array.from(new Set(sections.flatMap((section) => section.methods)));

const makeUnifiedMusicSection = (
    sourceSections: CampaignFilterSection[],
): CampaignFilterSection => {
    const itemsByGroupAndId = getItemsByGroupAndId(sourceSections);
    const mappedItems = UNIFIED_MUSIC_GENRES.map((config) =>
        getMappedItem(
            config,
            itemsByGroupAndId,
            COMMUNITY_MUSIC_GROUP,
            CREATOR_MUSIC_GROUP,
            "unifiedMusicGenres",
        ),
    );

    const knownIds = new Set(
        [
            ...UNIFIED_MUSIC_GENRES.flatMap((config) => [
                ...(config.communityId
                    ? [`${COMMUNITY_MUSIC_GROUP}:${config.communityId}`]
                    : []),
                ...(config.creatorId
                    ? [`${CREATOR_MUSIC_GROUP}:${config.creatorId}`]
                    : []),
            ]),
            `${COMMUNITY_MUSIC_GROUP}:techno`,
            `${COMMUNITY_MUSIC_GROUP}:house`,
            `${CREATOR_MUSIC_GROUP}:techno`,
            `${CREATOR_MUSIC_GROUP}:house`,
            `${CREATOR_MUSIC_GROUP}:electronic_techno`,
            `${CREATOR_MUSIC_GROUP}:electronic_house`,
            `${CREATOR_MUSIC_GROUP}:electronic_music`,
            `${CREATOR_MUSIC_GROUP}:mainstream_music`,
        ],
    );

    const makeParent = (
        key: "techno" | "house",
        label: string,
    ): CampaignFilterItem => {
        const children = mappedItems.filter(
            (item) =>
                UNIFIED_MUSIC_GENRES.find((config) => config.key === item.id)
                    ?.parent === key,
        );

        return {
            id: `music-genres-${key}-group`,
            rawId: "",
            apiValue: "",
            group: "unifiedMusicGenres",
            filterName: label,
            count: children.reduce((total, child) => total + child.count, 0),
            selectionMode: "children-only",
            children,
        };
    };

    const topLevelItems = mappedItems.filter(
        (item) =>
            !UNIFIED_MUSIC_GENRES.find((config) => config.key === item.id)?.parent,
    );

    return {
        id: "music-genres",
        title: "Music Genres",
        methods: ["and", "or"],
        filters: [
            makeParent("techno", "Techno"),
            makeParent("house", "House"),
            ...topLevelItems,
            ...getUnmappedItems({
                sections: sourceSections,
                groups: MUSIC_GROUPS,
                knownIds,
                uiGroup: "unifiedMusicGenres",
            }),
        ],
    };
};

const makeUnifiedTopicsSection = (
    sourceSections: CampaignFilterSection[],
): CampaignFilterSection => {
    const itemsByGroupAndId = getItemsByGroupAndId(sourceSections);
    const knownIds = new Set(
        [
            ...UNIFIED_ADDITIONAL_TOPICS.flatMap((config) => [
                ...(config.communityId
                    ? [`${COMMUNITY_TOPICS_GROUP}:${config.communityId}`]
                    : []),
                ...(config.creatorId
                    ? [`${CREATOR_TOPICS_GROUP}:${config.creatorId}`]
                    : []),
            ]),
            `${CREATOR_TOPICS_GROUP}:music`,
            `${CREATOR_TOPICS_GROUP}:entertainment`,
        ],
    );

    return {
        id: "additional-topics",
        title: "Additional Topics",
        methods: collectMethods(sourceSections),
        filters: [
            ...UNIFIED_ADDITIONAL_TOPICS.map((config) =>
                getMappedItem(
                    config,
                    itemsByGroupAndId,
                    COMMUNITY_TOPICS_GROUP,
                    CREATOR_TOPICS_GROUP,
                    "unifiedAdditionalTopics",
                ),
            ),
            ...getUnmappedItems({
                sections: sourceSections,
                groups: TOPICS_GROUPS,
                knownIds,
                uiGroup: "unifiedAdditionalTopics",
            }),
        ],
    };
};

export const normalizeCampaignFilterSections = (
    sections: CampaignFilterSection[],
): CampaignFilterSection[] => {
    const musicSections = sections.filter((section) =>
        isSectionForGroups(section, MUSIC_GROUPS),
    );
    const topicSections = sections.filter((section) =>
        isSectionForGroups(section, TOPICS_GROUPS),
    );
    let hasInsertedMusic = false;
    let hasInsertedTopics = false;

    return sections.flatMap((section) => {
        if (isSectionForGroups(section, MUSIC_GROUPS)) {
            if (hasInsertedMusic) return [];
            hasInsertedMusic = true;
            return [makeUnifiedMusicSection(musicSections)];
        }

        if (isSectionForGroups(section, TOPICS_GROUPS)) {
            if (hasInsertedTopics) return [];
            hasInsertedTopics = true;
            return [makeUnifiedTopicsSection(topicSections)];
        }

        return [section];
    });
};
