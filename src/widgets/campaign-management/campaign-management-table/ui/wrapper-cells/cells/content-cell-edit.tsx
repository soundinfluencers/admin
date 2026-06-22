//@ts-nocheck
import React from "react";

import eye from "./assets/eye.svg";
import plus from "./assets/plus.svg";
import trash from "./assets/trash-2.svg";
import { useCampaignManagementStore } from "@/entities/campaign-managment/store/campaign-management.store.ts";
import { Dropdown } from "@/shared/ui/dropdown-table/dropdowns-table";
import { Modal } from "@/shared/ui/modal/modal.tsx";
import {VideoPreview} from "@/features/campaigns/preview/preview-video-component.tsx";

type Props = {
    accountKey: string;
    selectedItem?: any;

    isOpen: boolean;
    onOpenChange: (open: boolean) => void;

    platformItems: any[];
    selectedContent: number;
    setSelectedContent: (v: number | ((prev: number) => number)) => void;
    setSelectedPd: (v: number) => void;

    socialMedia?: string;
    media0?: any;
    group: string;
};

export const ContentCellEdit = React.memo(function ContentCellEdit({
                                                                       accountKey,
                                                                       selectedItem,
                                                                       isOpen,
                                                                       onOpenChange,
                                                                       group,
                                                                       platformItems,
                                                                       selectedContent,
                                                                       setSelectedContent,
                                                                       setSelectedPd,
                                                                       socialMedia,
                                                                       media0,
                                                                   }: Props) {
    const addContentItem = useCampaignManagementStore((s) => s.addContentItem);
    const removeContentItem = useCampaignManagementStore((s) => s.removeContentItem);
    const visibleItems = React.useMemo(
        () =>
            (platformItems ?? [])
                .map((item, idx) => ({ item, idx }))
                .filter(({ item }) => String(item?.mainLink ?? "").trim().length > 0),
        [platformItems],
    );
    const [popUp, setPopUp] = React.useState(false);
    const [selectedVideo, setSelectedVideo] = React.useState({
        index: 1,
        link: "",
    });

    const [addModal, setAddModal] = React.useState(false);
    const [newLink, setNewLink] = React.useState("");

    const [deleteModal, setDeleteModal] = React.useState(false);
    const [deleteIdx, setDeleteIdx] = React.useState<number>(-1);

    const selectedLink = platformItems?.[selectedContent]?.mainLink ?? "";
    const setContentField = useCampaignManagementStore((s) => s.setContentField);
    const currentItem = platformItems?.[selectedContent];
    const currentContentId = currentItem?._id;
    const currentLink = currentItem?.mainLink ?? "";
    const selectContent = React.useCallback(
        (idx: number) => {
            setSelectedContent(idx);
            onOpenChange(false);
        },
        [setSelectedContent, onOpenChange],
    );

    const onClickVideo = React.useCallback((idx: number, link: string) => {
        setSelectedVideo({ index: idx + 1, link });
        setPopUp(true);
    }, []);

    const openAddModal = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNewLink("");
        setAddModal(true);
    }, []);

    const closeAddModal = React.useCallback(() => {
        setAddModal(false);
        setNewLink("");
    }, []);

    const createVideo = React.useCallback(() => {
        const link = newLink.trim();
        if (!link) return;

        const sm = String(socialMedia ?? "").toLowerCase();
        if (!sm) return;

        addContentItem(sm, { mainLink: link }, selectedItem?._id);

        setSelectedContent(platformItems?.length);

        closeAddModal();
        onOpenChange(false);
    }, [
        newLink,
        socialMedia,
        selectedItem?._id,
        addContentItem,
        platformItems?.length,
        setSelectedContent,
        setSelectedPd,
        closeAddModal,
        onOpenChange,
    ]);

    const openDelete = React.useCallback((idx: number) => {
        setDeleteIdx(idx);
        setDeleteModal(true);
    }, []);

    const closeModalVideo = React.useCallback(() => {
        setPopUp(false);
    }, []);

    const confirmDelete = React.useCallback(() => {
        const item = platformItems?.[deleteIdx];
        const contentId = item?._id;

        setDeleteModal(false);
        if (!contentId) return;

        removeContentItem(String(contentId));

        setSelectedContent((prev) => {
            const current =
                typeof prev === "number" ? prev : selectedContent;

            if (deleteIdx < 0) return current;
            if (current === deleteIdx) return Math.max(0, deleteIdx - 1);
            if (current > deleteIdx) return current - 1;
            return current;
        });

    }, [
        platformItems,
        deleteIdx,
        removeContentItem,
        setSelectedContent,
        setSelectedPd,
        selectedContent,
    ]);

    const groupTitle = (value: string) => {
        switch (value) {
            case "main":
                return "Video";
            case "music":
                return "Song";
            case "press":
                return "Press";
            default:
                return "";
        }
    };

    const onClickHeaderEye = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = platformItems?.[selectedContent]?.mainLink ?? "";
        onClickVideo(selectedContent, link);
    };
    const pathLower = media0?.pathLower;
    const videoUrl = media0?.url ?? null;
    return (
        <>
            <Dropdown
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                content
                selected={
                    <div className="content-cell-static">
                        <span onClick={onClickHeaderEye} className="eye">
                            <img src={eye} alt="" />
                        </span>
                        <p title={selectedLink}>
                            {selectedLink
                                ? `${groupTitle(group)} ${selectedContent + 1}`
                                : "—"}
                        </p>
                    </div>
                }
            >
                <div className="post-description-block">
                    <ul className="dropdown-list">
                        {platformItems?.map((item: any, idx: number) => (
                            <li
                                className={`content-cell ${
                                    selectedContent === idx ? "active-content" : ""
                                }`}
                                key={item?._id ?? idx}
                                onClick={() => selectContent(idx)}
                            >
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClickVideo(idx, item.mainLink);
                                    }}
                                    className="eye"
                                >
                                    <img src={eye} alt="" />
                                </span>

                                <p
                                    className="hidden-text desc-li"
                                    title={item?.mainLink ?? ""}
                                >
                                    {item?.mainLink ? `${groupTitle(group)} ${idx + 1}` : "—"}
                                </p>

                                <img
                                    className="trash"
                                    src={trash}
                                    alt=""
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDelete(idx);
                                    }}
                                />
                            </li>
                        ))}
                    </ul>

                    <div onClick={openAddModal} className="add-video">
                        <div className="add-desc__icon">
                            <img src={plus} alt="" />
                        </div>
                        <p>Add new {groupTitle(group)}</p>
                    </div>
                </div>
            </Dropdown>

            {addModal && (
                <Modal onClose={closeAddModal}>
                    <div className="modal-card">
                        <h2>Add video</h2>
                        <input
                            autoFocus
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            type="text"
                            placeholder="Paste video link..."
                        />
                        <div className="modal-card-btn">
                            <button className='modal-secondary-btn' type="button" onClick={closeAddModal}>Cancel</button>
                            <button className='modal-primary-btn' type="button" onClick={createVideo}>Create</button>
                        </div>
                    </div>
                </Modal>
            )}

            {deleteModal && (
                <Modal onClose={() => setDeleteModal(false)}>
                    <div className="onDeleteModal">
                        <h2>
                            Are you sure you want to <br /> delete this video?
                        </h2>
                        <p>You won’t be able to restore this!</p>
                        <div className="onDeleteModal-btn">
                            <button className='modal-secondary-btn' type="button" onClick={() => setDeleteModal(false)}>
                                Cancel
                            </button>
                            <button className='modal-primary-btn' type="button" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {popUp && (
                <Modal onClose={closeModalVideo}>
                    <div className="modal-card">
                        <h2>Video {selectedVideo.index}</h2>
                        {videoUrl || pathLower ? (
                            <VideoPreview
                                className="modal-card-video"
                                videoUrl={videoUrl}
                                pathLower={pathLower}
                            />
                        ) : (
                            <input
                                type="text"
                                value={currentLink}
                                onChange={(e) => {
                                    if (!currentContentId) return;
                                    setContentField(String(currentContentId), "mainLink", e.target.value);
                                }}
                                placeholder="Paste video link..."
                            />
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
});