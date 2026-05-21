import React from "react";
import bookmark from "../assets/bookmark.svg";
import linkIcon from "../assets/link (1).svg";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store";

type Props = {
    canEdit: boolean;
    contentId?: string;
    mergedItem: any;
    showStoryTag: boolean;
    showStoryLink: boolean;
};

export const ExtraFieldsCard: React.FC<Props> = ({
                                                     canEdit,
                                                     contentId,
                                                     mergedItem,
                                                     showStoryTag,
                                                     showStoryLink,
                                                 }) => {
    const setContentField = useCampaignManagementStore((s) => s.setContentField);

    return (
        <>
            {showStoryTag && (
                <div className="live-view-card__fill-data">
                    <h3>Story Tag</h3>
                    <div className="fill-input">
                        <img src={bookmark} alt="" />
                        {canEdit && contentId ? (
                            <input
                                value={mergedItem?.taggedUser ?? ""}
                                onChange={(e) =>
                                    setContentField(contentId, "taggedUser", e.target.value)
                                }
                                placeholder="Tagged user"
                            />
                        ) : (
                            <p>{mergedItem?.taggedUser || "—"}</p>
                        )}
                    </div>
                </div>
            )}

            {showStoryLink && (
                <div className="live-view-card__fill-data">
                    <h3>Story Links</h3>
                    <div className="fill-input">
                        <img src={linkIcon} alt="" />
                        {canEdit && contentId ? (
                            <input
                                value={mergedItem?.taggedLink ?? ""}
                                onChange={(e) =>
                                    setContentField(contentId, "taggedLink", e.target.value)
                                }
                                placeholder="Tagged link"
                            />
                        ) : (
                            <p>{mergedItem?.taggedLink || "—"}</p>
                        )}
                    </div>
                </div>
            )}

        </>
    );
};