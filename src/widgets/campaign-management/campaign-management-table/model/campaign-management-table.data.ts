
import type { TableGroup } from "@/entities/campaign-managment/model/campaign.managment.ts";

export type CampaignManagementColumnKey =
    | "network"
    | "followers"
    | "date"
    | "content"
    | "description"
    | "tag"
    | "link"
    | "brief"
    | "genres"
    | "countries"
    | "tracktitle"
    | "pressLink"
    | "artworkLink"
    | "action";

export const COLUMN_TITLES: Record<CampaignManagementColumnKey, string> = {
    network: "Networks",
    followers: "Followers",
    date: "Req. date",
    content: "Content",
    description: "Post description",
    tag: "Story tag",
    link: "Story link",
    brief: "Additional brief",
    genres: "Genres",
    countries: "Top 5 Countries",
    tracktitle: "Track Title",
    pressLink: "Link to press release",
    artworkLink: "Artwork Link",
    action: "Actions",
};

const GROUP_COLUMN_TITLES: Partial<
    Record<TableGroup, Partial<Record<CampaignManagementColumnKey, string>>>
> = {
    main: {
        description: "Post description",
        tag: "Story tag",
        link: "Story link",
    },
    music: {
        content: "Track link",
        tracktitle: "Track Title",
    },
    press: {
        content: "Link to music, events, news",
        artworkLink: "Link to artwork & press shots",
        pressLink: "Link to press release",
        brief: "Additional brief",
    },
};

export const getTitle = (
    group: TableGroup,
    key: CampaignManagementColumnKey,
) => {
    return GROUP_COLUMN_TITLES[group]?.[key] ?? COLUMN_TITLES[key] ?? key;
};

export const REQ_DATE_OPTIONS = ["ASAP", "BEFORE", "AFTER"] as const;

export const getDropdownOptions = (key: any): string[] => {
    switch (key) {
        case "date":
            return [...REQ_DATE_OPTIONS];
        default:
            return [];
    }
};

export const TABLE_COLUMNS: Record<
    any,
    Record<TableGroup, CampaignManagementColumnKey[]>
> = {
    default: {
        main: [
            "network",
            "followers",
            "date",
            "content",
            "description",
            "tag",
            "link",
            "brief",
        ],
        music: [
            "network",
            "followers",
            "date",
            "content",
            "tracktitle",
            "brief",
        ],
        press: [
            "network",
            "date",
            "content",
            "artworkLink",
            "pressLink",
            "brief",
        ],
    },

    changeView: {
        main: [
            "network",
            "followers",
            "content",
            "description",
            "genres",
            "countries",
        ],
        music: [
            "network",
            "followers",
            "content",
            "tracktitle",
            "genres",
        ],
        press: [
            "network",
            "brief",
            "genres",
        ],
    },
};

export const getColumns = (
    changeView: boolean,
    group: TableGroup,
    canEdit = false,
): CampaignManagementColumnKey[] => {
    const mode: any = changeView ? "changeView" : "default";
    const base = [...TABLE_COLUMNS[mode][group]];

    if (!changeView && canEdit && !base.includes("action")) {
        base.push("action");
    }

    return canEdit ? base : base.filter((col) => col !== "action");
};

export const TABLE_COLUMN_WIDTHS: Record<
    any,
    Record<any, Record<TableGroup, any>>
> = {
    default: {
        readonly: {
            main: {
                network: 200,
                followers: 105,
                date: 98,
                content: 141,
                description: 299,
                tag: 113,
                link: 125,
                brief: 142,
            },
            music: {
                network: 185,
                followers: 96,
                date: 120,
                content: 180,
                tracktitle: 200,
                brief: 260,
            },
            press: {
                network: 185,
                date: 120,
                content: 180,
                artworkLink: 220,
                pressLink: 220,
                brief: 260,
            },
        },

        editable: {
            main: {
                network: 200,
                followers: 100,
                date: 98,
                content: 141,
                description: 220,
                tag: 113,
                link: 125,
                brief: 121,
                action: 76,
            },
            music: {
                network: 185,
                followers: 96,
                date: 120,
                content: 150,
                tracktitle: 270,
                brief: 260,
                action: 66,
            },
            press: {
                network: 185,
                date: 120,
                content: 150,
                artworkLink: 220,
                pressLink: 220,
                brief: 260,
                action: 70,
            },
        },
    },

    changeView: {
        readonly: {
            main: {
                network: 170,
                followers: 100,
                genres: 283,
                countries: 277,
                content: 180,
                description: 200,
            },
            music: {
                network: 185,
                followers: 96,
                genres: 300,
                content: 180,
                tracktitle: 200,
            },
            press: {
                network: 185,
                genres: 663,
                brief: 257,
            },
        },

        editable: {
            main: {
                network: 170,
                followers: 100,
                genres: 283,
                countries: 277,
                content: 180,
                description: 200,
            },
            music: {
                network: 185,
                followers: 96,
                genres: 300,
                content: 180,
                tracktitle: 200,
            },
            press: {
                network: 185,
                genres: 663,
                brief: 257,
            },
        },
    },
};
export const INSIGHT_BASE_COLUMNS = [
    "network",
    "followers",
    "postlink",
    "screenshot",
    "impressions",
    "likes",
    "comments",
    "saves",
    "shares",
] as const;

export const INSIGHT_EXTRA_COLUMNS = [

    "status",
    "paid",
    "action",
] as const;

export const INSIGHT_ALL_COLUMNS = [
    ...INSIGHT_BASE_COLUMNS,
    ...INSIGHT_EXTRA_COLUMNS,
] as const;

export type InsightColumnKey = (typeof INSIGHT_ALL_COLUMNS)[number] | "cpm";
export const insightTitles: Record<InsightColumnKey, string> = {
    network: "Networks",
    followers: "Followers",
    postlink: "Post link",
    screenshot: "Screenshot",
    impressions: "Impressions",
    cpm: "CPM",
    likes: "Likes",
    comments: "Comments",
    saves: "Saves",
    shares: "Shares",
    status: "Status",
    paid: "Paid",
    action: "Actions",
};

export const INSIGHT_COLUMN_WIDTHS: Record<InsightColumnKey, number> = {
    network: 170,
    followers: 105,
    postlink: 101,
    screenshot: 101,
    impressions: 117,
    cpm: 103,
    likes: 90,
    comments: 103,
    saves: 90,
    shares: 90,
    status: 95,
    paid: 55,
    action: 107,
};
export const getTableColumnWidths = ({
                                         group,
                                         changeView,
                                         canEdit,
                                     }: {
    group: TableGroup;
    changeView: boolean;
    canEdit: boolean;
}): any => {
    const mode: any = changeView ? "changeView" : "default";
    const variant: any = canEdit ? "editable" : "readonly";

    return TABLE_COLUMN_WIDTHS[mode][variant][group] ?? {};
};

type GetInsightColumnsParams = {
    status?: string | null;
    canEdit?: boolean;
    showCpm?: boolean;
};

export const getInsightColumns = ({
                                      status,
                                      canEdit,
                                      showCpm = false,
                                  }: GetInsightColumnsParams): InsightColumnKey[] => {
    const normalizedStatus = String(status ?? "").toLowerCase();

    const base: InsightColumnKey[] = [
        "network",
        "followers",
        "postlink",
        "screenshot",
        showCpm ? "cpm" : "impressions",
        "likes",
        "comments",
        "saves",
        "shares",
    ];

    if (normalizedStatus === "completed") {
        return base;
    }

    if (canEdit) {
        return [...base, "status", "paid", "action"];
    }

    return [...base, "status", "paid"];
};