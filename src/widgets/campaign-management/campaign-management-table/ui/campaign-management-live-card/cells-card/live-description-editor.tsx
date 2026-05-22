//@ts-nocheck
import React from "react";

import editIcon from "../assets/edit.svg";
import check from "../assets/check (1).svg";
import x from "../assets/x.svg";
import plus from "../assets/plus.svg";
import trash from "../assets/trash-2.svg";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store";
import { Dropdown } from "@/shared/ui/dropdown-table/dropdowns-table.tsx";

type Desc = {
    _id?: string;
    description: string;
};

type Props = {
    title?: string;
    canEdit: boolean;
    contentId?: string;
    descriptions: Desc[];
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    selectedIdx: number;
    setSelectedIdx: (v: number) => void;
};

export const LiveDescriptionsEditorDropdown: React.FC<Props> = ({
                                                                    title = "Post description",
                                                                    canEdit,
                                                                    contentId,
                                                                    descriptions,
                                                                    isOpen,
                                                                    onToggle,
                                                                    onClose,
                                                                    selectedIdx,
                                                                    setSelectedIdx,
                                                                }) => {
    const clickTimerRef = React.useRef<number | null>(null);

    const addContentDescription = useCampaignManagementStore(
        (s) => s.addContentDescription,
    );
    const updateContentDescription = useCampaignManagementStore(
        (s) => s.updateContentDescription,
    );
    const removeContentDescription = useCampaignManagementStore(
        (s) => s.removeContentDescription,
    );

    const [editId, setEditId] = React.useState<string | null>(null);
    const [editText, setEditText] = React.useState("");
    const [isAdding, setIsAdding] = React.useState(false);
    const [newText, setNewText] = React.useState("");
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

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

        setEditId(null);
        setEditText("");
        setIsAdding(false);
        setNewText("");
        setDeleteId(null);
    }, [contentId]);

    const safeSelectedText =
        descriptions?.[selectedIdx]?.description ||
        descriptions?.[0]?.description ||
        "—";

    const stop = (e: React.SyntheticEvent) => e.stopPropagation();

    const selectDescription = React.useCallback(
        (idx: number) => {
            if (editId !== null || deleteId !== null || isAdding) return;

            setSelectedIdx(idx);
            onClose();
        },
        [editId, deleteId, isAdding, setSelectedIdx, onClose],
    );

    const startEdit = React.useCallback(
        (e: React.MouseEvent, descId: string, text: string) => {
            e.preventDefault();
            e.stopPropagation();

            if (!canEdit) return;

            setDeleteId(null);
            setIsAdding(false);
            setEditId(descId);
            setEditText(text ?? "");
        },
        [canEdit],
    );

    const handleItemClick = React.useCallback(
        (idx: number) => {
            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
            }

            clickTimerRef.current = window.setTimeout(() => {
                selectDescription(idx);
                clickTimerRef.current = null;
            }, 220);
        },
        [selectDescription],
    );

    const handleItemDoubleClick = React.useCallback(
        (e: React.MouseEvent, descId: string, text: string) => {
            e.preventDefault();
            e.stopPropagation();

            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
                clickTimerRef.current = null;
            }

            startEdit(e, descId, text);
        },
        [startEdit],
    );

    const cancelEdit = React.useCallback(() => {
        setEditId(null);
        setEditText("");
    }, []);

    const commitEdit = React.useCallback(
        (descId: string) => {
            if (!contentId) return;

            const trimmed = editText.trim();

            if (!trimmed) {
                cancelEdit();
                return;
            }

            updateContentDescription(contentId, descId, trimmed);
            cancelEdit();
        },
        [contentId, editText, updateContentDescription, cancelEdit],
    );

    const commitAdd = React.useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();

            if (!contentId) return;

            const trimmed = newText.trim();

            if (!trimmed) {
                setIsAdding(false);
                setNewText("");
                return;
            }

            addContentDescription(contentId, trimmed);
            setSelectedIdx(descriptions.length);

            setIsAdding(false);
            setNewText("");
        },
        [
            contentId,
            newText,
            addContentDescription,
            setSelectedIdx,
            descriptions.length,
        ],
    );

    const confirmDelete = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();

            if (!contentId || !deleteId) return;

            const deleteIndex = descriptions.findIndex(
                (item) => String(item._id) === String(deleteId),
            );

            removeContentDescription(contentId, deleteId);

            let nextSelectedIdx = selectedIdx;

            if (selectedIdx === deleteIndex) {
                nextSelectedIdx = Math.max(0, deleteIndex - 1);
            } else if (selectedIdx > deleteIndex) {
                nextSelectedIdx = selectedIdx - 1;
            }

            setSelectedIdx(nextSelectedIdx);

            if (editId === deleteId) {
                cancelEdit();
            }

            setDeleteId(null);
        },
        [
            contentId,
            deleteId,
            descriptions,
            removeContentDescription,
            selectedIdx,
            setSelectedIdx,
            editId,
            cancelEdit,
        ],
    );

    const cancelDelete = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteId(null);
    }, []);

    if (!contentId) {
        return (
            <Dropdown
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (open) onToggle();
                    else onClose();
                }}
                selected={<p className="hidden-text desc">—</p>}
            >
                <div onClick={stop} style={{ padding: 8 }}>
                    —
                </div>
            </Dropdown>
        );
    }

    return (
        <div className="live-view-card__fill-data">
            <h3>{title}</h3>

            <Dropdown
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (open) onToggle();
                    else onClose();
                }}
                selected={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            minHeight: "26px",
                            width: "100%",
                        }}
                    >
                        <img src={editIcon} alt="" />
                        <p className="hidden-text desc">{safeSelectedText}</p>
                    </div>
                }
            >
                <div
                    className="post-description-block"
                    onClick={stop}
                    onMouseDown={stop}
                >
                    <ul className="dropdown-list">
                        {descriptions.map((desc, idx) => {
                            const descId = String(desc?._id ?? "");

                            return (
                                <li
                                    key={descId || idx}
                                    className="desc-li"
                                    onClick={() => handleItemClick(idx)}
                                    onDoubleClick={(e) =>
                                        handleItemDoubleClick(
                                            e,
                                            descId,
                                            desc.description ?? "",
                                        )
                                    }
                                >
                                    <span className={selectedIdx === idx ? "active" : ""}>
                                        {idx + 1}
                                    </span>

                                    {!canEdit ? (
                                        <p
                                            className="hidden-text desc-li"
                                            title={desc.description}
                                        >
                                            {desc.description}
                                        </p>
                                    ) : editId === descId ? (
                                        <input
                                            className="hidden-text desc-li"
                                            autoFocus
                                            value={editText}
                                            onClick={stop}
                                            onMouseDown={stop}
                                            onChange={(e) => setEditText(e.target.value)}
                                            onBlur={() => commitEdit(descId)}
                                            onKeyDown={(e) => {
                                                e.stopPropagation();

                                                if (e.key === "Enter") {
                                                    commitEdit(descId);
                                                }

                                                if (e.key === "Escape") {
                                                    cancelEdit();
                                                }
                                            }}
                                        />
                                    ) : (
                                        <p
                                            className="hidden-text desc-li"
                                            title={desc.description}
                                        >
                                            {desc.description}
                                        </p>
                                    )}

                                    {canEdit &&
                                        (deleteId === descId ? (
                                            <div className="confirm-delete" onClick={stop}>
                                                <img
                                                    src={check}
                                                    alt=""
                                                    style={{ cursor: "pointer" }}
                                                    onClick={confirmDelete}
                                                />
                                                <img
                                                    src={x}
                                                    alt=""
                                                    style={{ cursor: "pointer" }}
                                                    onClick={cancelDelete}
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
                                                        window.clearTimeout(
                                                            clickTimerRef.current,
                                                        );
                                                        clickTimerRef.current = null;
                                                    }

                                                    setEditId(null);
                                                    setEditText("");
                                                    setDeleteId(descId);
                                                }}
                                            />
                                        ))}
                                </li>
                            );
                        })}

                        {canEdit && isAdding && (
                            <li
                                className="desc-li"
                                onClick={stop}
                                onMouseDown={stop}
                                style={{ cursor: "default" }}
                            >
                                <span>{descriptions.length + 1}</span>

                                <input
                                    autoFocus
                                    value={newText}
                                    placeholder={`New ${title.toLowerCase()}...`}
                                    onChange={(e) => setNewText(e.target.value)}
                                    onClick={stop}
                                    onMouseDown={stop}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();

                                        if (e.key === "Enter") {
                                            commitAdd();
                                        }

                                        if (e.key === "Escape") {
                                            setIsAdding(false);
                                            setNewText("");
                                        }
                                    }}
                                />

                                <div className="confirm-delete" onClick={stop}>
                                    <img
                                        src={check}
                                        alt=""
                                        style={{ cursor: "pointer" }}
                                        onClick={commitAdd}
                                    />
                                    <img
                                        src={x}
                                        alt=""
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAdding(false);
                                            setNewText("");
                                        }}
                                    />
                                </div>
                            </li>
                        )}
                    </ul>

                    {canEdit && !isAdding && (
                        <div
                            className="add-desc"
                            onClick={(e) => {
                                e.stopPropagation();

                                if (clickTimerRef.current) {
                                    window.clearTimeout(clickTimerRef.current);
                                    clickTimerRef.current = null;
                                }

                                setEditId(null);
                                setDeleteId(null);
                                setIsAdding(true);
                                setNewText("");
                            }}
                        >
                            <div className="add-desc__icon">
                                <img src={plus} alt="" />
                            </div>
                            <p>Add new {title.toLowerCase()}</p>
                        </div>
                    )}
                </div>
            </Dropdown>
        </div>
    );
};