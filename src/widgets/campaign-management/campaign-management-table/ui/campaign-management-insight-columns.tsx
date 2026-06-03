//@ts-nocheck

import type { ColumnDef } from "@tanstack/react-table";
import styles from "./arrow.module.scss";
import up from "../assets/Vector.svg";
import down from "../assets/chevron-down.svg";
import imageIcon from "../assets/image.svg";

import { NetworkTableCell } from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/network-table-cell";
import { FollowersTableCell } from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/followers-table-cell";
import { MetricCell } from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells-insight/metric-cell.tsx";
import { LinkCell } from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells-insight/link-cell.tsx";
import { ActionInsight } from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/action-insight.tsx";
import { PaidInsight } from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/paid-insight.tsx";

import type {
    CampaignManagementInsightRow,
} from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.types.ts";

import {
    INSIGHT_COLUMN_WIDTHS,
    insightTitles,
    getInsightColumns,
    type InsightColumnKey,
} from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.data.ts";

import {
    getPromoStatusLabel,
} from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.helpers.ts";

import {
    getAccountKey,
} from "@/entities/campaign-managment/store/campaign-management.store";

const renderSortableHeader = (title: string, column: any) => {
    const sort = column.getIsSorted();

    return (
        <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className={`${styles.sortHeader} ${sort ? styles.sortHeaderActive : ""}`}
        >
            <span className={styles.sortTitle}>{title}</span>

            <span className={styles.sortIcons}>
                <img
                    src={up}
                    alt=""
                    className={`${styles.sortImage} ${sort === "asc" ? styles.sortImageActive : ""}`}
                />
                <img
                    src={down}
                    alt=""
                    className={`${styles.sortImage} ${sort === "desc" ? styles.sortImageActive : ""}`}
                />
            </span>
        </button>
    );
};

type Params = {
    status?: string | null;
    canEdit?: boolean;
    canContactInfluencer?: boolean;
    showCpm?: boolean;
    recentlyAddedAccountKeys?: string[];
    onToggleCpm?: () => void;
    onDelete?: (row: CampaignManagementInsightRow) => void;
    onWhatsApp?: (row: CampaignManagementInsightRow) => void;
    onEmail?: (row: CampaignManagementInsightRow) => void;
    onEditLink?: (
        row: CampaignManagementInsightRow,
        field: "postLink" | "screenshot",
    ) => void;
    onMetricChange?: (
        row: CampaignManagementInsightRow,
        field: "impressions" | "like" | "comments" | "shares" | "saves" | "rating",
        value: number,
    ) => void;
    onPay?: (row: CampaignManagementInsightRow) => void;
};

const STATUS_SORT_ORDER: Record<string, number> = {
    Requested: 1,
    Accepted: 2,
    Declined: 3,
    Posted: 4,
    "Insights Submitted": 5,
    "N/A": 6,
};

export const getCampaignManagementInsightColumns = ({
                                                        status,
                                                        canEdit,
                                                        canContactInfluencer = false,
                                                        onDelete,
                                                        onWhatsApp,
                                                        onEmail,
                                                        onEditLink,
                                                        onMetricChange,
                                                        onPay,
                                                        showCpm,
                                                        onToggleCpm,
                                                        recentlyAddedAccountKeys = [],
                                                    }: Params): ColumnDef<CampaignManagementInsightRow>[] => {
    const keys = getInsightColumns({ status, canEdit, showCpm });

    const map: Record<InsightColumnKey, ColumnDef<CampaignManagementInsightRow>> = {
        network: {
            id: "network",
            header: insightTitles.network,
            size: INSIGHT_COLUMN_WIDTHS.network,
            cell: ({ row }) => (
                <NetworkTableCell row={{ account: row.original.account } as any} />
            ),
        },

        followers: {
            id: "followers",
            header: ({ column }) => renderSortableHeader(insightTitles.followers, column),
            size: INSIGHT_COLUMN_WIDTHS.followers,
            accessorFn: (row) => Number(row.account.followers ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <FollowersTableCell row={{ account: row.original.account } as any} />
            ),
        },

        postlink: {
            id: "postlink",
            header: insightTitles.postlink,
            size: INSIGHT_COLUMN_WIDTHS.postlink,
            cell: ({ row }) => (
                <LinkCell
                    url={row.original.account.postLink}
                    canEdit={canEdit}
                    onEdit={() => onEditLink?.(row.original, "postLink")}
                />
            ),
        },

        screenshot: {
            id: "screenshot",
            header: insightTitles.screenshot,
            size: INSIGHT_COLUMN_WIDTHS.screenshot,
            cell: ({ row }) => (
                <LinkCell
                    leftIcon={imageIcon}
                    url={row.original.account.screenshot}
                    canEdit={canEdit}
                    onEdit={() => onEditLink?.(row.original, "screenshot")}
                />
            ),
        },

        impressions: {
            id: "impressions",
            header: ({ column }) => (
                <div onDoubleClick={() => onToggleCpm?.()}>
                    {renderSortableHeader(insightTitles.impressions, column)}
                </div>
            ),
            size: INSIGHT_COLUMN_WIDTHS.impressions,
            accessorFn: (row) => Number(row.account.impressions ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell
                    value={row.original.account.impressions ?? 0}
                    canEdit={canEdit}
                    onChange={(value) => onMetricChange?.(row.original, "impressions", value)}
                />
            ),
        },

        cpm: {
            id: "cpm",
            header: ({ column }) => (
                <div onDoubleClick={() => onToggleCpm?.()}>
                    {renderSortableHeader(insightTitles.cpm, column)}
                </div>
            ),
            size: INSIGHT_COLUMN_WIDTHS.cpm,
            accessorFn: (row) => Number(row.account.cpm ?? 0),
            enableSorting: true,
            cell: ({ row }) => {
                const rawValue = Number(row.original.account.cpm ?? 0);
                const roundedValue = Number(rawValue.toFixed(2));

                return <MetricCell value={roundedValue} canEdit={false} />;
            },
        },

        likes: {
            id: "likes",
            header: ({ column }) => renderSortableHeader(insightTitles.likes, column),
            size: INSIGHT_COLUMN_WIDTHS.likes,
            accessorFn: (row) => Number(row.account.like ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell
                    value={row.original.account.like ?? 0}
                    canEdit={canEdit}
                    onChange={(value) => onMetricChange?.(row.original, "like", value)}
                />
            ),
        },

        comments: {
            id: "comments",
            header: ({ column }) => renderSortableHeader(insightTitles.comments, column),
            size: INSIGHT_COLUMN_WIDTHS.comments,
            accessorFn: (row) => Number(row.account.comments ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell
                    value={row.original.account.comments ?? 0}
                    canEdit={canEdit}
                    onChange={(value) => onMetricChange?.(row.original, "comments", value)}
                />
            ),
        },

        saves: {
            id: "saves",
            header: ({ column }) => renderSortableHeader(insightTitles.saves, column),
            size: INSIGHT_COLUMN_WIDTHS.saves,
            accessorFn: (row) => Number(row.account.saves ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell
                    value={row.original.account.saves ?? 0}
                    canEdit={canEdit}
                    onChange={(value) => onMetricChange?.(row.original, "saves", value)}
                />
            ),
        },

        shares: {
            id: "shares",
            header: ({ column }) => renderSortableHeader(insightTitles.shares, column),
            size: INSIGHT_COLUMN_WIDTHS.shares,
            accessorFn: (row) => Number(row.account.shares ?? 0),
            enableSorting: true,
            cell: ({ row }) => (
                <MetricCell
                    value={row.original.account.shares ?? 0}
                    canEdit={canEdit}
                    onChange={(value) => onMetricChange?.(row.original, "shares", value)}
                />
            ),
        },

        status: {
            id: "status",
            header: ({ column }) => renderSortableHeader(insightTitles.status, column),
            size: INSIGHT_COLUMN_WIDTHS.status,
            accessorFn: (row) => getPromoStatusLabel(row.account.statusLabel ?? ""),
            enableSorting: true,
            sortingFn: (rowA, rowB, columnId) => {
                const valueA = String(rowA.getValue(columnId) ?? "N/A");
                const valueB = String(rowB.getValue(columnId) ?? "N/A");

                const orderA = STATUS_SORT_ORDER[valueA] ?? 999;
                const orderB = STATUS_SORT_ORDER[valueB] ?? 999;

                return orderA - orderB;
            },
            cell: ({ row }) => (
                    <div><p className='status-insight'>{getPromoStatusLabel(row.original.account.statusLabel ?? "")}</p></div>
            ),
        },

        paid: {
            id: "paid",
            header: insightTitles.paid,
            size: INSIGHT_COLUMN_WIDTHS.paid,
            cell: ({ row }) => (
                <PaidInsight
                    isPaid={Boolean(row.original.account.closePromo === "close")}
                    canEdit={true}
                    onClick={() => onPay?.(row.original)}
                />
            ),
        },

        action: {
            id: "action",
            header: insightTitles.action,
            size: INSIGHT_COLUMN_WIDTHS.action,
            cell: ({ row }) => {
                const accountKey = getAccountKey(row.original.account);
                const isRecentlyAdded = recentlyAddedAccountKeys.includes(String(accountKey));

                const onlyDelete = isRecentlyAdded || !canContactInfluencer;

                return (
                    <ActionInsight
                        onlyDelete={onlyDelete}
                        onDelete={() => onDelete?.(row.original)}
                        onWhatsApp={() => onWhatsApp?.(row.original)}
                        onEmail={() => onEmail?.(row.original)}
                        disabledDelete={!canEdit}
                        disabledWhatsApp={!canEdit || !canContactInfluencer || isRecentlyAdded}
                        disabledEmail={!canEdit || !canContactInfluencer || isRecentlyAdded}
                    />
                );
            },
        },

    };

    return keys.map((key) => map[key]);
};