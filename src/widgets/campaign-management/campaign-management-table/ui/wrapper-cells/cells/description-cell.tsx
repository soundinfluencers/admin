//@ts-nocheck

import React from "react";
import check from "./assets/check.svg";
import { Link } from "react-router-dom";
import { Dropdown } from "@/shared/ui/dropdown-table/dropdowns-table";

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;

    platformItems: any[];
    selectedContent: number;
    selectedPd: number;

    group: string;
    field?: "tracktitle" | "artworkLink";

    setSelectedPd: (v: number) => void;
    status?: string;
};

export const DescriptionCell = React.memo(function DescriptionCell({
                                                                       isOpen,
                                                                       onOpenChange,
                                                                       platformItems,
                                                                       selectedContent,
                                                                       selectedPd,
                                                                       setSelectedPd,
                                                                       group,
                                                                       field,
                                                                       status,
                                                                   }: Props) {
    const descriptions = platformItems?.[selectedContent]?.descriptions ?? [];

    const normalizedStatus = String(status ?? "").toLowerCase();
    const isLocked =
        normalizedStatus === "closed" ||
        normalizedStatus === "completed";

    const selectedDescription = descriptions?.[selectedPd] ?? null;
    const selectedText = String(selectedDescription?.description ?? "");

    const normalizeLink = React.useCallback((value: string) => {
        if (!value) return "#";
        return value.startsWith("http") ? value : `https://${value}`;
    }, []);

    const selectPd = React.useCallback(
        (idx: number) => {
            if (isLocked) return;

            setSelectedPd(idx);
            onOpenChange(false);
        },
        [setSelectedPd, onOpenChange, isLocked],
    );


    if (isLocked || descriptions.length <= 1) {
        return (
            <div className={group === "press" ? "" : "no-edit"}>
                {group === "press" || field === "artworkLink" ? (
                    selectedText ? (
                        <Link to={normalizeLink(selectedText)} target="_blank">
                            <p className="hidden-text tagged-link">
                                {selectedText}
                            </p>
                        </Link>
                    ) : (
                        <p className="hidden-text tagged-link">—</p>
                    )
                ) : (
                    <p className="hidden-text desc">
                        {selectedText || "—"}
                    </p>
                )}
            </div>
        );
    }

    if (group === "press" || field === "artworkLink") {
        return selectedText ? (
            <Link to={normalizeLink(selectedText)} target="_blank">
                <p className="hidden-text tagged-link">
                    {selectedText}
                </p>
            </Link>
        ) : (
            <p className="hidden-text tagged-link">—</p>
        );
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            selected={
                <p className="hidden-text desc">
                    {selectedText || "—"}
                </p>
            }
        >
            <ul className="dropdown-list">
                {descriptions.map((desc: any, optionIndex: number) => (
                    <li
                        title={desc?.description}
                        key={desc?._id ?? optionIndex}
                        onClick={() => selectPd(optionIndex)}
                    >
                        <span className={selectedPd === optionIndex ? "active" : ""}>
                            {optionIndex + 1}
                        </span>

                        <p className="hidden-text desc">
                            {desc.description || "-"}
                        </p>

                        {selectedPd === optionIndex && (
                            <img className="check" src={check} alt="" />
                        )}
                    </li>
                ))}
            </ul>
        </Dropdown>
    );
});