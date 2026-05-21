import type {ShareLinkKind, ViewMode} from "./campaign-management-table.types";
import {getPdfFile} from "@/entities/campaign-managment/api/campaign-controls.api.ts";
import {toast} from "react-toastify";

export const getGroupBySocial = (
    social: string,
): "main" | "music" | "press" => {
    const s = String(social ?? "").toLowerCase();

    if (["facebook", "instagram", "youtube", "tiktok"].includes(s)) {
        return "main";
    }

    if (["spotify", "soundcloud"].includes(s)) {
        return "music";
    }

    return "press";
};

export const getInitialView = ({
                                   status,
                                   canEdit,
                               }: {
    status?: string;
    canEdit?: boolean;
}): ViewMode => {
    const normalizedStatus = String(status ?? "").toLowerCase();

    if (normalizedStatus === "proposal") {
        return canEdit ? -1 : 0;
    }

    return 0;
};

export const getIsCampaignEditable = ({
                                          status,
                                          canEdit,
                                          view,
                                      }: {
    status?: string;
    canEdit?: boolean;
    view: ViewMode;
}) => {
    const normalizedStatus = String(status ?? "").toLowerCase();

    if (!canEdit) return false;

    if (normalizedStatus === "proposal") {
        return view === -1;
    }

    return false;
};

export function formatFollowers(count: number | string): string {
    const num = typeof count === "string" ? parseInt(count, 10) : count;

    if (isNaN(num)) return "0";

    if (num < 1000) return String(num);
    if (num < 1_000_000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;

    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export const buildCampaignManagementShareLink = ({
                                                     id,
                                                     kind,
                                                     socialMedia,
                                                     origin = "https://test.soundinfluencers.com",
                                                 }: {
    id: string;
    kind: ShareLinkKind;
    socialMedia?: string;
    origin?: string;
}) => {
    const safeId = encodeURIComponent(String(id ?? ""));
    const safeType =
        kind === "proposal"
            ? "proposal"
            : encodeURIComponent(String(socialMedia ?? "proposal").toLowerCase());

    return `${origin}/promo-share/${safeId}/${safeType}`;
};

export const getCampaignKindByStatus = (
    status?: string | null,
): "proposal" | "regular" => {
    const normalized = String(status ?? "").toLowerCase();

    if (normalized === "proposal") {
        return "proposal";
    }

    return "regular";
};

export const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

export const getPDF = async (id: string) => {
    try {
        const res = await getPdfFile(id);

        downloadBlob(res.data as Blob, `campaign-${id}.pdf`);
        toast.success("PDF created successfully!");
    } catch (error: any) {
        console.error(error);

        if (error.code === "ECONNABORTED") {
            toast.error("PDF generation took too long");
        } else {
            toast.error("Failed to create PDF");
        }

        throw error;
    }
};
export const formatCampaignDate = (
    value?: string | Date,
    locale: string = "en-US",
) => {
    if (!value) return "—";

    let date: Date | null = null;

    if (value instanceof Date) {
        date = value;
    }

    if (typeof value === "string") {
        if (/^\d{2}\.\d{2}\.\d{2}$/.test(value)) {
            const [day, month, yearShort] = value.split(".");
            date = new Date(Number(yearShort) + 2000, Number(month) - 1, Number(day));
        } else {
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) {
                date = parsed;
            }
        }
    }

    if (!date) return "—";

    return date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};