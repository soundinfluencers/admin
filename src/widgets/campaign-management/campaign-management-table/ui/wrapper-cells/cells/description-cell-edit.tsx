//@ts-nocheck

import React from "react";
import check from "./assets/check (1).svg";
import x from "./assets/x (2).svg";
import plus from "./assets/plus.svg";
import trash from "./assets/trash-2.svg";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store.ts";
import { Dropdown } from "@/shared/ui/dropdown-table/dropdowns-table.tsx";

type Desc = { _id?: string; description: string };

type Props = {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onOpenChange: (open: boolean) => void;
    platformItems: any[];
    selectedContent: number;
    onSelectDescriptionId?: (descriptionId: string) => void;
    selectedPd: number;
    setSelectedPd: (v: number) => void;
    group: string;
};

const objectId = () => {
    const bytes = new Uint8Array(12);

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < 12; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }

    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

export const DescriptionCellEdit = React.memo(function DescriptionCellEdit({
                                                                               isOpen,
                                                                               onToggle,
                                                                               onClose,
                                                                               platformItems,
                                                                               selectedContent,
                                                                               selectedPd,
                                                                               setSelectedPd,
                                                                               group,
                                                                               onSelectDescriptionId,
                                                                               onOpenChange,
                                                                           }: Props) {
    const baseItem = platformItems?.[selectedContent];
    const contentId: string | undefined = baseItem?._id;

    const clickTimerRef = React.useRef<number | null>(null);

    const setContentDescriptions = useCampaignManagementStore(
        (s) => s.setContentDescriptions,
    );

    const editingDescs: Desc[] = (baseItem?.descriptions ?? []) as Desc[];

    const safeSelectedText =
        String(editingDescs?.[selectedPd]?.description ?? "").trim() || "—";

    const [editIdx, setEditIdx] = React.useState<number | null>(null);
    const [editText, setEditText] = React.useState("");
    const [deleteIdx, setDeleteIdx] = React.useState<number | null>(null);

    const [isAdding, setIsAdding] = React.useState(false);
    const [newText, setNewText] = React.useState("");

    React.useEffect(() => {
        return () => {
            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (clickTimerRef.current) {
            window.clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
        }

        setIsAdding(false);
        setNewText("");
        setDeleteIdx(null);
        setEditIdx(null);
        setEditText("");
    }, [contentId]);

    const groupTitle = React.useCallback((value: string) => {
        switch (value) {
            case "main":
                return "post description";
            case "music":
                return "track title";
            case "press":
                return "artwork link";
            default:
                return "description";
        }
    }, []);

    const selectPd = React.useCallback(
        (idx: number, close = true) => {
            if (editIdx !== null || deleteIdx !== null || isAdding) return;

            const nextId = String(editingDescs?.[idx]?._id ?? "");

            setSelectedPd(idx);
            onSelectDescriptionId?.(nextId);

            if (close) {
                onOpenChange(false);
            }
        },
        [
            editIdx,
            deleteIdx,
            isAdding,
            editingDescs,
            setSelectedPd,
            onSelectDescriptionId,
            onOpenChange,
        ],
    );

    const startEdit = React.useCallback(
        (e: React.MouseEvent, idx: number, text: string) => {
            e.preventDefault();
            e.stopPropagation();

            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
                clickTimerRef.current = null;
            }

            setDeleteIdx(null);
            setIsAdding(false);
            setEditIdx(idx);
            setEditText(text ?? "");
        },
        [],
    );

    const handleItemClick = React.useCallback(
        (idx: number) => {
            if (editIdx !== null || deleteIdx !== null || isAdding) return;

            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
            }

            clickTimerRef.current = window.setTimeout(() => {
                selectPd(idx, true);
                clickTimerRef.current = null;
            }, 250);
        },
        [selectPd, editIdx, deleteIdx, isAdding],
    );

    const handleItemDoubleClick = React.useCallback(
        (e: React.MouseEvent, idx: number, text: string) => {
            e.preventDefault();
            e.stopPropagation();

            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
                clickTimerRef.current = null;
            }

            startEdit(e, idx, text);
        },
        [startEdit],
    );

    const cancelEdit = React.useCallback(() => {
        setEditIdx(null);
        setEditText("");
    }, []);

    const updateDescriptionByIndex = React.useCallback(
        (idx: number, value: string) => {
            if (!contentId) return;

            const next = editingDescs.map((item, index) =>
                index === idx ? { ...item, description: value } : item,
            );

            setContentDescriptions(contentId, next);
        },
        [contentId, editingDescs, setContentDescriptions],
    );

    const commitEdit = React.useCallback(
        (idx: number) => {
            const trimmed = editText.trim();

            if (!trimmed) {
                cancelEdit();
                return;
            }

            updateDescriptionByIndex(idx, trimmed);
            cancelEdit();
        },
        [editText, updateDescriptionByIndex, cancelEdit],
    );

    const startAdd = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (clickTimerRef.current) {
            window.clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
        }

        setEditIdx(null);
        setDeleteIdx(null);
        setIsAdding(true);
        setNewText("");
    }, []);

    const cancelAdd = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();

        setIsAdding(false);
        setNewText("");
    }, []);

    const commitAdd = React.useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();

            const trimmed = newText.trim();
            if (!contentId) return;

            if (!trimmed) {
                cancelAdd();
                return;
            }

            const created = {
                _id: objectId(),
                description: trimmed,
            };

            const nextDescs = [...editingDescs, created];

            setContentDescriptions(contentId, nextDescs);
            setSelectedPd(nextDescs.length - 1);
            onSelectDescriptionId?.(created._id ?? "");

            setIsAdding(false);
            setNewText("");
        },
        [
            contentId,
            newText,
            editingDescs,
            setContentDescriptions,
            setSelectedPd,
            onSelectDescriptionId,
            cancelAdd,
        ],
    );

    const confirmDelete = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();

            if (deleteIdx === null || !contentId) return;

            const nextDescs = editingDescs.filter((_, idx) => idx !== deleteIdx);

            setContentDescriptions(contentId, nextDescs);

            let nextSelectedIdx = selectedPd;

            if (selectedPd === deleteIdx) {
                nextSelectedIdx = Math.max(0, deleteIdx - 1);
            } else if (selectedPd > deleteIdx) {
                nextSelectedIdx = selectedPd - 1;
            }

            setSelectedPd(nextSelectedIdx);
            onSelectDescriptionId?.(
                String(nextDescs?.[nextSelectedIdx]?._id ?? ""),
            );

            if (editIdx === deleteIdx) {
                cancelEdit();
            }

            setDeleteIdx(null);
        },
        [
            deleteIdx,
            contentId,
            editingDescs,
            setContentDescriptions,
            selectedPd,
            setSelectedPd,
            onSelectDescriptionId,
            editIdx,
            cancelEdit,
        ],
    );

    const cancelDelete = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteIdx(null);
    }, []);

    if (!contentId) {
        return (
            <td className="tableBase__td">
                <p className="hidden-text desc">—</p>
            </td>
        );
    }

    if (group === "press") {
        return (
            <input
                className="hidden-text desc"
                value={editingDescs?.[0]?.description ?? ""}
                onChange={(e) => {
                    if (!contentId) return;

                    const value = e.target.value;

                    const next = editingDescs.length
                        ? editingDescs.map((item, idx) =>
                            idx === 0 ? { ...item, description: value } : item,
                        )
                        : [{ _id: objectId(), description: value }];

                    setContentDescriptions(contentId, next);
                }}
                placeholder="Artwork link"
            />
        );
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            selected={<p className="hidden-text desc">{safeSelectedText}</p>}
        >
            <div
                className="post-description-block"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <ul className="dropdown-list">
                    {editingDescs.map((desc, idx) => (
                        <li
                            className="hidden-text desc-li"
                            key={desc?._id ?? idx}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => handleItemClick(idx)}
                            onDoubleClick={(e) =>
                                handleItemDoubleClick(e, idx, desc.description ?? "")
                            }
                        >
                            <span className={selectedPd === idx ? "active" : ""}>
                                {idx + 1}
                            </span>

                            {editIdx === idx ? (
                                <input
                                    className="edit-desc"
                                    autoFocus
                                    value={editText}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onDoubleClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onBlur={() => commitEdit(idx)}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();

                                        if (e.key === "Enter") {
                                            commitEdit(idx);
                                        }

                                        if (e.key === "Escape") {
                                            cancelEdit();
                                        }
                                    }}
                                />
                            ) : (
                                <p
                                    className="hidden-text desc-li"
                                    title={desc?.description}
                                >
                                    {desc?.description}
                                </p>
                            )}

                            {deleteIdx === idx ? (
                                <div
                                    className="confirm-delete"
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <img
                                        src={check}
                                        alt=""
                                        onClick={confirmDelete}
                                        style={{ cursor: "pointer" }}
                                    />
                                    <img
                                        src={x}
                                        alt=""
                                        onClick={cancelDelete}
                                        style={{ cursor: "pointer" }}
                                    />
                                </div>
                            ) : (
                                <img
                                    className="trash"
                                    src={trash}
                                    alt=""
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        if (clickTimerRef.current) {
                                            window.clearTimeout(clickTimerRef.current);
                                            clickTimerRef.current = null;
                                        }

                                        setEditIdx(null);
                                        setEditText("");
                                        setDeleteIdx(idx);
                                    }}
                                />
                            )}
                        </li>
                    ))}

                    {isAdding && (
                        <li
                            key="__new__"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{ cursor: "default" }}
                        >
                            <span>{editingDescs.length + 1}</span>

                            <input
                                autoFocus
                                value={newText}
                                placeholder={`New ${groupTitle(group)}...`}
                                onChange={(e) => setNewText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    e.stopPropagation();

                                    if (e.key === "Enter") {
                                        commitAdd();
                                    }

                                    if (e.key === "Escape") {
                                        cancelAdd();
                                    }
                                }}
                            />

                            <div
                                className="confirm-delete"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={check}
                                    alt=""
                                    onClick={commitAdd}
                                    style={{ cursor: "pointer" }}
                                />
                                <img
                                    src={x}
                                    alt=""
                                    onClick={cancelAdd}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                        </li>
                    )}
                </ul>

                {!isAdding && (
                    <div onClick={startAdd} className="add-desc">
                        <div className="add-desc__icon">
                            <img src={plus} alt="" />
                        </div>
                        <p>Add new {groupTitle(group)}</p>
                    </div>
                )}
            </div>
        </Dropdown>
    );
});