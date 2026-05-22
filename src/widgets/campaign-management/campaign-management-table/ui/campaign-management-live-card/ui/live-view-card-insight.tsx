import './live-view-card.scss'
import comment from "../assets/mage_message-dots-round.svg";
import heart from "../assets/mdi_heart.svg";
import bookmark from "../assets/iconoir_bookmark.svg";
import share from "../assets/share.svg";
import link from "../assets/link (1).svg";
import chat from "../assets/bar-chart.svg";


import React from "react";
import {PreviewPhoto} from "@/features/campaigns/preview/preview-component.tsx";
import {getSocialMediaIcon} from "@/shared/libs/get-social-media-icon.ts";
import {ModalVideo} from "@/shared/ui/modal-video/ModalVideo.tsx";
import {VideoPreview} from "@/features/campaigns/preview/preview-video-component.tsx";


interface LiveViewCardProps {
    isMusic?: boolean;
    item: any;
}

export const LiveViewCardInsight: React.FC<LiveViewCardProps> = ({
                                                                     item,
                                                                 }) => {
    const [isVideoOpen, setIsVideoOpen] = React.useState(false);
    console.log(item);
    const media0 = item?.mediaCache?.items?.[0];
    const pathLower = media0?.pathLower;
    const videoUrl = media0?.url ?? null;
    const hasVideo = Boolean(pathLower);
    return (
        <div className="live-view-cardInsight">
            <div className="live-view-cardInsight__video">
                <div
                    role={hasVideo ? "button" : undefined}
                    style={{ cursor: hasVideo ? "pointer" : "default" }}
                    onClick={() => {
                        if (!hasVideo) return;
                        setIsVideoOpen(true);
                    }}>
                    <PreviewPhoto
                        urlInsight={item.screenshot}
                        previewUrl={media0?.previewUrl}
                        pathLower={media0?.pathLower}
                        fileId={media0?.fileId}
                    />
                </div>
            </div>
            <div
                onClick={(e) => {
                    e.stopPropagation();

                    if (!item.postLink) return;

                    window.open(
                        item.postLink,
                        "_blank",
                        "noopener,noreferrer",
                    );
                }}
                className="live-view-cardInsight__fill-data"
            >
                <img src={getSocialMediaIcon(item.socialMedia as any)} alt="" />

                <div
                    className="fill-input"
                    style={{ cursor: item.postLink ? "pointer" : "default" }}
                >
                    <img src={link} alt="" />
                    <p>{item.postLink || "—"}</p>
                </div>
            </div>
            <div className="live-view-cardInsight__fill-data">
                <div className="fill-input">
                    <img src={comment} alt="" />
                    <p>{item.comments ?? 0}</p>
                </div>
            </div>{" "}
            <div className="live-view-cardInsight__fill-data">
                <div className="fill-input">
                    <img src={heart} alt="" />
                    <p>{item.like ?? 0}</p>
                </div>
            </div>
            <div className="live-view-cardInsight__fill-data">
                <div className="fill-input">
                    <img src={bookmark} alt="" />
                    <p>{item.saves ?? 0}</p>
                </div>
            </div>
            <div className="live-view-cardInsight__fill-data">
                <div className="fill-input">
                    <img src={share} alt="" />
                    <p>{item.shares ?? 0}</p>
                </div>
            </div>
            <div className="live-view-cardInsight__fill-data">
                <div className="fill-input">
                    <img src={chat} alt="" />
                    <p>{item.impressions ?? 0}</p>
                </div>
            </div>
            {isVideoOpen && (
                <ModalVideo
                    className="modal-block"
                    onClose={() => setIsVideoOpen(false)}>
                    <VideoPreview videoUrl={videoUrl} pathLower={pathLower} />
                    {/* <div className="name-video">name video</div> */}
                </ModalVideo>
            )}
        </div>
    );
};
