// @ts-nocheck

import React from "react";

import type {
    CampaignManagementRow,
} from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.types";

import {
    useCampaignManagementStore,
} from "@/entities/campaign-managment/store/campaign-management.store";

import {
    DescriptionCellEdit,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/description-cell-edit.tsx";

import {
    DescriptionCell,
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/description-cell.tsx";

type Props = {
    row: CampaignManagementRow;
    canEdit: boolean;
    field?: "tracktitle" | "artworkLink";
    status?: string;
};

export const DescriptionTableCell: React.FC<Props> = ({
                                                          row,
                                                          canEdit,
                                                          field,
                                                          status,
                                                      }) => {
    const setAccountSelectedContent = useCampaignManagementStore(
        (s) => s.setAccountSelectedContent,
    );

    const [isOpen, setIsOpen] = React.useState(false);

    const normalizedStatus = String(status ?? "").toLowerCase();
    const isCompleted = normalizedStatus === "completed";

    const setSelectedPd = React.useCallback(
        (nextPd: number) => {
            if (isCompleted) return;

            const item = row.platformItems?.[row.selectedContentIndex];
            const desc = item?.descriptions?.[nextPd];

            if (!item || !desc) return;

            setAccountSelectedContent(row.accountKey, {
                campaignContentItemId: String(item._id ?? ""),
                descriptionId: String(desc._id ?? ""),
            });
        },
        [
            isCompleted,
            row.platformItems,
            row.selectedContentIndex,
            row.accountKey,
            setAccountSelectedContent,
        ],
    );

    const onSelectDescriptionId = React.useCallback(
        (descriptionId: string) => {
            if (isCompleted) return;

            const item = row.platformItems?.[row.selectedContentIndex];

            if (!item) return;

            setAccountSelectedContent(row.accountKey, {
                campaignContentItemId: String(item._id ?? ""),
                descriptionId: String(descriptionId ?? ""),
            });
        },
        [
            isCompleted,
            row.platformItems,
            row.selectedContentIndex,
            row.accountKey,
            setAccountSelectedContent,
        ],
    );

    if (canEdit && !isCompleted) {
        return (
            <DescriptionCellEdit
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                platformItems={row.platformItems}
                selectedContent={row.selectedContentIndex}
                selectedPd={row.selectedDescriptionIndex}
                setSelectedPd={setSelectedPd}
                group={row.group}
                status={normalizedStatus}
                onSelectDescriptionId={onSelectDescriptionId}
            />
        );
    }

    return (
        <DescriptionCell
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            platformItems={row.platformItems}
            selectedContent={row.selectedContentIndex}
            selectedPd={row.selectedDescriptionIndex}
            setSelectedPd={setSelectedPd}
            group={row.group}
            field={field}
            status={normalizedStatus}
            canEdit={false}
        />
    );
};