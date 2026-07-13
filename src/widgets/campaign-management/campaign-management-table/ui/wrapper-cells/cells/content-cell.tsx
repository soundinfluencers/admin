//@ts-nocheck

import React from "react";
import eye from "./assets/eye.svg";
import { Dropdown } from "@/shared/ui/dropdown-table/dropdowns-table.tsx";
import { Modal } from "@/shared/ui/modal/modal.tsx";
import { VideoPreview } from "@/features/campaigns/preview/preview-video-component.tsx";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;

  platformItems: any[];
  selectedContent: number;
  setSelectedContent: (v: number) => void;

  setSelectedPd: (v: number) => void;
  socialMedia?: string;
  media0?: any;
  group: string;
  canEdit?: boolean;
  status?: string;
};

export const ContentCell = React.memo(function ContentCell({
  isOpen,
  onOpenChange,
  platformItems,
  selectedContent,
  setSelectedContent,
  socialMedia,
  media0,
  group,
  canEdit = false,
  status,
}: Props) {
  const [popUp, setPopUp] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState({
    index: 1,
    link: "",
  });

  const normalizedStatus = String(status ?? "").toLowerCase();

  const isLocked =
    normalizedStatus === "closed" ||
    normalizedStatus === "completed" ||
    !canEdit;

  const selectedItem = platformItems?.[selectedContent];
  const selectedLink = selectedItem?.mainLink;

  // const pathLower = selectedItem?.mediaCache?.items?.[0]?.pathLower ?? media0?.pathLower;
  // const videoUrl = selectedItem?.mediaCache?.items?.[0]?.url ?? media0?.url ?? null;

  const groupTitle = (group: string) => {
    switch (group) {
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

  const onClickSelect = React.useCallback(
    (optionIndex: number) => {
      if (isLocked) return;

      setSelectedContent(optionIndex);
      onOpenChange(false);
    },
    [setSelectedContent, onOpenChange, isLocked],
  );

  const onClickVideo = React.useCallback((optionIndex: number, link: string) => {
    setSelectedVideo({
      index: optionIndex + 1,
      link,
    });
    setPopUp(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setPopUp(false);
  }, []);

  const onClickHeaderEye = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickVideo(selectedContent, selectedLink ?? "");
  };

  if (isLocked || platformItems?.length <= 1) {
    return (
      <>
        <div className="content-cell-static no-edit">
                    <span onClick={onClickHeaderEye} className="eye">
                        <img src={eye} alt=""/>
                    </span>

          <p title={selectedLink}>
            {selectedLink
              ? `${groupTitle(group)} ${selectedContent + 1}`
              : "—"}
          </p>
        </div>

        {popUp && (
          <Modal onClose={closeModal}>
            <div className="modal-card">
              <h2>{groupTitle(group)} {selectedVideo.index}</h2>
              <input
                type="text"
                value={selectedVideo.link || selectedLink || ""}
                readOnly
              />

              {/*{videoUrl || pathLower ? (*/}
              {/*    <VideoPreview*/}
              {/*        className="modal-card-video"*/}
              {/*        videoUrl={videoUrl}*/}
              {/*        pathLower={pathLower}*/}
              {/*    />*/}
              {/*) : (*/}

              {/*)}*/}
            </div>
          </Modal>
        )}
      </>
    );
  }

  return (
    <>
      <Dropdown
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        content
        selected={
          <div className="content-cell-static">
                        <span onClick={onClickHeaderEye} className="eye">
                            <img src={eye} alt=""/>
                        </span>

            <p title={selectedLink}>
              {selectedLink
                ? `${groupTitle(group)} ${selectedContent + 1}`
                : "—"}
            </p>
          </div>
        }
      >
        <ul className="dropdown-list">
          {platformItems?.map((item: any, optionIndex: number) => (
            <li
              className={`content-cell ${
                selectedContent === optionIndex ? "active-content" : ""
              }`}
              key={`${item?._id ?? optionIndex}-${socialMedia}`}
              onClick={() => onClickSelect(optionIndex)}
            >
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                onClickVideo(optionIndex, item.mainLink);
                              }}
                              className="eye"
                            >
                                <img src={eye} alt=""/>
                            </span>

              {item.mainLink
                ? `${groupTitle(group)} ${optionIndex + 1}`
                : "—"}
            </li>
          ))}
        </ul>
      </Dropdown>

      {popUp && (
        <Modal onClose={closeModal}>
          <div className="modal-card">
            <h2>{groupTitle(group)} {selectedVideo.index}</h2>
            <input
              type="text"
              value={selectedVideo.link || selectedLink || ""}
              readOnly
            />

            {/*{videoUrl || pathLower ? (*/}
            {/*    <VideoPreview*/}
            {/*        className="modal-card-video"*/}
            {/*        videoUrl={videoUrl}*/}
            {/*        pathLower={pathLower}*/}
            {/*    />*/}
            {/*) : (*/}

            {/*)}*/}
          </div>
        </Modal>
      )}
    </>
  );
});
