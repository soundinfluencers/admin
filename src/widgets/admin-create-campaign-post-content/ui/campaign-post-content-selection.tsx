import React from "react";
import styles from "./campaign-post-content-selection.module.scss";
import type { CampaignPostContentAccount } from "../model/campaign-post-content.types";
import { normalizeSocial } from "../model/campaign-post-content.helpers";
import {formatFollowers} from "@/entities/campaign-managment/model/campaign-management.helpers.ts";
import {getSocialMediaIconPostContent} from "@/shared/libs/get-social-media-icon.ts";
import type {SocialMedia} from "@/entities/campaign-managment/model/campaign.managment.ts";


type Props = {
    accounts: CampaignPostContentAccount[];
    totalPrice: number;
    onEditSelection: () => void;
    currency?: string;
};

type SelectionGroup = {
    key: string;
    title: string;
    socialMedia: string;
    items: CampaignPostContentAccount[];
};

const formatPrice = (value?: number | string) => {
    if (value === undefined || value === null || value === "") return "";
    return `${value}`;
};

export const CampaignPostContentSelection: React.FC<Props> = ({
                                                                  accounts,
                                                                  totalPrice,
                                                                  onEditSelection,currency
                                                              }) => {
    console.log(accounts)
    const groups: SelectionGroup[] = [
        {
            key: "instagram-creators",
            title: "Instagram Creators",
            socialMedia: "instagram",
            items: accounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "instagram" &&
                    item.profileType === "creator",
            ),
        },
        {
            key: "instagram-communities",
            title: "Instagram Communities",
            socialMedia: "instagram",
            items: accounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "instagram" &&
                    item.profileType === "community",
            ),
        },
        {
            key: "tiktok-creators",
            title: "TikTok Creators",
            socialMedia: "tiktok",
            items: accounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "tiktok" &&
                    item.profileType === "creator",
            ),
        },
        {
            key: "tiktok-communities",
            title: "TikTok Communities",
            socialMedia: "tiktok",
            items: accounts.filter(
                (item) =>
                    normalizeSocial(item.socialMedia) === "tiktok" &&
                    item.profileType === "community",
            ),
        },
        {
            key: "facebook",
            title: "Facebook",
            socialMedia: "facebook",
            items: accounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "facebook",
            ),
        },
        {
            key: "youtube",
            title: "YouTube",
            socialMedia: "youtube",
            items: accounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "youtube",
            ),
        },
        {
            key: "spotify",
            title: "Spotify",
            socialMedia: "spotify",
            items: accounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "spotify",
            ),
        },
        {
            key: "soundcloud",
            title: "SoundCloud",
            socialMedia: "soundcloud",
            items: accounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "soundcloud",
            ),
        },
        {
            key: "press",
            title: "Press",
            socialMedia: "press",
            items: accounts.filter(
                (item) => normalizeSocial(item.socialMedia) === "press",
            ),
        },
    ].filter((group) => group.items.length > 0);

    const renderAccountRow = (item: CampaignPostContentAccount) => {
        return (
            <div key={item.accountId} className={styles.accountRow}>
                <div className={styles.accountMain}>
                    <div className={styles.accountAvatar}>
                        {item.logoUrl ? <img src={item.logoUrl} alt="" /> : null}
                    </div>

                    <div className={styles.accountInfo}>
                        <p>{item.username}</p>
                    </div>
                </div>

                <div className={styles.accountMeta}>
                    {item.followers !== 0 && (
                        <span>{formatFollowers(item.followers || 0)} followers</span>
                    )}
                </div>

                <div className={styles.accountPrice}>
                    <span>{formatPrice(item.price)}{currency}</span>
                </div>
            </div>
        );
    };

    const renderGroup = (group: SelectionGroup) => (
        <section key={group.key} className={styles.groupSection}>
            <div className={styles.groupHeader}>
                <img
                    src={
                        getSocialMediaIconPostContent(
                            group.socialMedia as SocialMedia,
                        ) || ""
                    }
                    alt=""
                />
                <h4>{group.title}</h4>
            </div>

            <div className={styles.groupBody}>
                {group.items.map(renderAccountRow)}
            </div>
        </section>
    );

    return (
        <aside className={styles.selection}>
            <div className={styles.selectionHead}>
                <h3>Your Selection</h3>

                <button type="button" onClick={onEditSelection}>
                    Edit Selection
                </button>
            </div>

            <div className={styles.selectionContent}>
                <div className={styles.manualSections}>
                    {groups.map(renderGroup)}
                </div>
            </div>

            <div className={styles.selectionFooter}>
                <h2>Total price: {totalPrice}{currency}</h2>
            </div>
        </aside>
    );
};