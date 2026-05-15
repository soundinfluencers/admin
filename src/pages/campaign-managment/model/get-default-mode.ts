export type PageMode = "strategy" | "insight";

export const getDefaultModeByStatus = (status?: string | null): PageMode => {
    const normalizedStatus = String(status ?? "").toLowerCase();

    if (normalizedStatus === "proposal") {
        return "strategy";
    }

    if (normalizedStatus === "distributing" || normalizedStatus === "completed"  || normalizedStatus === 'pending' || normalizedStatus === 'distributing') {
        return "insight";
    }

    return "strategy";
};