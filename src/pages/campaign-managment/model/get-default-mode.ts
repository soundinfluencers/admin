export type PageMode = "strategy" | "insight";

export const getDefaultModeByStatus = (status?: string | null): PageMode => {
    const normalizedStatus = String(status ?? "").toLowerCase();

    if (normalizedStatus === "proposal") {
        return "strategy";
    }

    if (normalizedStatus === "completed"  || normalizedStatus === 'pending') {
        return "insight";
    }

    return "strategy";
};
