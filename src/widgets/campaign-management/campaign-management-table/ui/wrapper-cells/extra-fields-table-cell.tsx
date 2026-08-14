import React from "react";
import { Link } from "react-router-dom";
import type { CampaignManagementRow } from "@/widgets/campaign-management/campaign-management-table/model/campaign-management-table.types.ts";
import {
    ExtraFieldCellEdit
} from "@/widgets/campaign-management/campaign-management-table/ui/wrapper-cells/cells/extra-fields-cell-edit.tsx";

type ExtraFieldType =
    | "tag"
    | "link"
    | "brief"
    | "tracktitle"
    | "pressLink"
    | "artworkLink";

type Props = {
    row: CampaignManagementRow;
    canEdit: boolean;
    field: ExtraFieldType;
};

const normalizeLink = (value: string) =>
    value.startsWith("http") ? value : `https://${value}`;

export const ExtraFieldsTableCell: React.FC<Props> = ({
                                                          row,
                                                          canEdit,
                                                          field,
                                                      }) => {
    const item = row.selectedItem;

    if (!item?._id) {
        return <p>—</p>;
    }

    if (field === "tag") {
        return canEdit ? (
            <ExtraFieldCellEdit
                contentId={item._id}
                field="taggedUser"
                value={item.taggedUser}
                placeholder="Tagged user"
            />
        ) : (
            <p className="hidden-text">{item.taggedUser || "—"}</p>
        );
    }

    if (field === "link") {
        return canEdit ? (
            <ExtraFieldCellEdit
                contentId={item._id}
                field="taggedLink"
                value={item.taggedLink}
                placeholder="Tagged link"
            />
        ) : (
            <>
                {item.taggedLink ? (
                    <Link
                        className="hidden-text tagged-link"
                        to={normalizeLink(item.taggedLink)}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {item.taggedLink}
                    </Link>
                ) : (
                    <p className="hidden-text">—</p>
                )}</>
        );
    }

    if (field === "brief" || field === "tracktitle") {
        const selectedAdditionalBriefId =
            row.account.selectedCampaignContentItem?.additionalBriefId;
        const selectedAdditionalBrief =
            row.account.selectedContentItem?.additionalBrief ??
            item.additionalBriefOptions?.find(
                (brief) => brief._id === selectedAdditionalBriefId,
            )?.additionalBrief ??
            item.additionalBrief;

        return canEdit ? (
            <ExtraFieldCellEdit
                contentId={item._id}
                field="additionalBrief"
                value={selectedAdditionalBrief}
                additionalBriefId={selectedAdditionalBriefId}
                accountKey={row.accountKey}
                placeholder={field === "tracktitle" ? "Track title" : "Additional brief"}
            />
        ) : (
            <p className="hidden-text">{selectedAdditionalBrief || "—"}</p>
        );
    }

    if (field === "pressLink") {
        return canEdit ? (
            <ExtraFieldCellEdit
                contentId={item._id}
                field="taggedLink"
                value={item.taggedLink}
                placeholder="Press link"
            />
        ) : (
            <>
                {item.taggedLink ? (
                    <Link
                        className="hidden-text tagged-link"
                        to={normalizeLink(item.taggedLink)}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {item.taggedLink}
                    </Link>
                ) : (
                    <p className="hidden-text">—</p>
                )}</>
        );
    }

    return canEdit ? (
        <ExtraFieldCellEdit
            contentId={item._id}
            field="mainLink"
            value={item.mainLink}
            placeholder="Artwork link"
        />
    ) : (
        <>
            {item.mainLink ? (
                <Link
                    className="hidden-text tagged-link"
                    to={normalizeLink(item.mainLink)}
                    target="_blank"
                    rel="noreferrer"
                >
                    {item.mainLink}
                </Link>
            ) : (
                <p className="hidden-text">—</p>
            )}</>
    );
};
