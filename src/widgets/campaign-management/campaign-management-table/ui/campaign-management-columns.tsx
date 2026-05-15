//@ts-nocheck

import type { ColumnDef } from "@tanstack/react-table";
import type { TableGroup } from "@/entities/campaign-managment/model/campaign.managment.ts";
import type {
    CampaignManagementRow,
} from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.types.ts";

import styles from "./arrow.module.scss";
import up from "../assets/Vector.svg";
import down from "../assets/chevron-down.svg";

import {
    type CampaignManagementColumnKey,
    getColumns,
    getTableColumnWidths,
    getTitle,
} from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.data.ts";

import {
    NetworkTableCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/network-table-cell.tsx";

import {
    FollowersTableCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/followers-table-cell.tsx";

import {
    DateTableCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/date-table-cell.tsx";

import {
    ContentTableCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/content-table-cell.tsx";

import {
    DescriptionTableCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/description-table-cell.tsx";

import {
    ExtraFieldsTableCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/extra-fields-table-cell.tsx";

import {
    GenresTableCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/genres-table-cell.tsx";

import {
    CountriesTableCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/countries-table-cell.tsx";

import {
    ActionCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/action-cell.tsx";

import "./table-base.scss";

type Params = {
    group: TableGroup;
    changeView: boolean;
    canEdit: boolean;
    status?: string;
};

const createColumn = (
    key: CampaignManagementColumnKey,
    group: TableGroup,
    width?: number,
    cell?: ColumnDef<CampaignManagementRow>["cell"],
    extra?: Partial<ColumnDef<CampaignManagementRow>>,
): ColumnDef<CampaignManagementRow> => ({
    id: key,
    header: getTitle(group, key),
    size: width,
    minSize: width,
    maxSize: width,
    cell,
    ...extra,
});

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
                    className={`${styles.sortImage} ${
                        sort === "asc" ? styles.sortImageActive : ""
                    }`}
                />

                <img
                    src={down}
                    alt=""
                    className={`${styles.sortImage} ${
                        sort === "desc" ? styles.sortImageActive : ""
                    }`}
                />
            </span>
        </button>
    );
};

export const getCampaignManagementColumns = ({
                                                 group,
                                                 changeView,
                                                 canEdit,
                                                 status,
                                             }: Params): ColumnDef<CampaignManagementRow>[] => {
    const normalizedStatus = String(status ?? "").toLowerCase();

    const isCompleted = normalizedStatus === "completed";

    /**
     * В completed нельзя выбирать другие descriptions.
     * Даже если canEdit=true, description/content selection должен быть read-only.
     */
    const canEditDescription = canEdit && !isCompleted;
    const canEditContent = canEdit && !isCompleted;

    const keys = getColumns(changeView, group, canEdit);
    const widths = getTableColumnWidths({ group, changeView, canEdit });

    const columnMap: Record<
        CampaignManagementColumnKey,
        ColumnDef<CampaignManagementRow>
    > = {
        network: createColumn("network", group, widths.network, ({ row }) => (
            <NetworkTableCell row={row.original} />
        )),

        followers: createColumn(
            "followers",
            group,
            widths.followers,
            ({ row }) => <FollowersTableCell row={row.original} />,
            {
                accessorFn: (row) => Number(row.account?.followers ?? 0),
                enableSorting: true,
                header: ({ column }) =>
                    renderSortableHeader(getTitle(group, "followers"), column),
            },
        ),

        date: createColumn("date", group, widths.date, ({ row }) => (
            <DateTableCell row={row.original} canEdit={canEdit && !isCompleted} />
        )),

        content: createColumn("content", group, widths.content, ({ row }) => (
            <ContentTableCell
                row={row.original}
                canEdit={canEditContent}
                status={normalizedStatus}
            />
        )),

        description: createColumn("description", group, widths.description, ({ row }) => (
            <DescriptionTableCell
                row={row.original}
                canEdit={canEditDescription}
                status={normalizedStatus}
            />
        )),

        tag: createColumn("tag", group, widths.tag, ({ row }) => (
            <ExtraFieldsTableCell
                row={row.original}
                field="tag"
                canEdit={canEdit && !isCompleted}
            />
        )),

        link: createColumn("link", group, widths.link, ({ row }) => (
            <ExtraFieldsTableCell
                row={row.original}
                field="link"
                canEdit={canEdit && !isCompleted}
            />
        )),

        brief: createColumn("brief", group, widths.brief, ({ row }) => (
            <ExtraFieldsTableCell
                row={row.original}
                field="brief"
                canEdit={canEdit && !isCompleted}
            />
        )),

        tracktitle: createColumn("tracktitle", group, widths.tracktitle, ({ row }) => (
            <DescriptionTableCell
                row={row.original}
                field="tracktitle"
                canEdit={canEditDescription}
                status={normalizedStatus}
            />
        )),

        pressLink: createColumn("pressLink", group, widths.pressLink, ({ row }) => (
            <ExtraFieldsTableCell
                row={row.original}
                field="pressLink"
                canEdit={canEdit && !isCompleted}
            />
        )),

        artworkLink: createColumn("artworkLink", group, widths.artworkLink, ({ row }) => (
            <DescriptionTableCell
                row={row.original}
                field="artworkLink"
                canEdit={canEditDescription}
                status={normalizedStatus}
            />
        )),

        genres: createColumn("genres", group, widths.genres, ({ row }) => (
            <GenresTableCell row={row.original} />
        )),

        countries: createColumn("countries", group, widths.countries, ({ row }) => (
            <CountriesTableCell row={row.original} />
        )),

        action: createColumn("action", group, widths.action, ({ row }) => {
            if (isCompleted) return null;

            return <ActionCell data={row.original.account} />;
        }),
    };

    return keys.map((key) => columnMap[key]);
};