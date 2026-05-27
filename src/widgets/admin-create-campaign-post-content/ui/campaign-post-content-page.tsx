import React from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider } from "react-hook-form";

import plus from "@/assets/icons/plus.svg";


import styles from "./campaign-post-content-page.module.scss";

import { useCampaignPostContent } from "../model/use-campaign-post-content";
import { CampaignPostContentBlockView } from "./campaign-post-content-block";
import { CampaignPostContentSelection } from "./campaign-post-content-selection";
import type {
    BuiltCampaignPostContentPayload,
    CampaignPostContentAccount,
    CampaignPostContentBlock,
} from "../model/campaign-post-content.types";
import {getSocialMediaIconPostContent} from "@/shared/libs/get-social-media-icon.ts";
import type {TSocialMedia} from "@/shared/types/types.ts";
import {
    useCampaignBuilderStore
} from "@/entities/admin-create-campaign/campaign-builder/model/campaign-builder.store.ts";

type Props = {
    accounts: CampaignPostContentAccount[];
    totalPrice: number;
    defaultCampaignName?: string;
    onSubmitPayload: (
        payload: BuiltCampaignPostContentPayload,
    ) => void | Promise<void>;
    defaultBlocks?: CampaignPostContentBlock[];
    defaultCampaignContent?: BuiltCampaignPostContentPayload["campaignContent"];
};

export const CampaignPostContentPage: React.FC<Props> = ({
                                                             accounts,
                                                             totalPrice,
                                                             defaultCampaignName,
                                                             onSubmitPayload,
                                                             defaultBlocks,
                                                             defaultCampaignContent,
                                                         }) => {
    const navigate = useNavigate();

    const vm = useCampaignPostContent({
        accounts,
        campaignPrice: totalPrice,
        campaignName: defaultCampaignName,
        defaultBlocks,
        defaultCampaignContent,
    });
    const selectedCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);

    const mainBlocks = vm.blocks.filter((item) => item.group === "main");
    const musicBlocks = vm.blocks.filter((item) => item.group === "music");
    const pressBlocks = vm.blocks.filter((item) => item.group === "press");

    const submit = vm.form.handleSubmit(async () => {
        const payload = vm.buildPayload();
        await onSubmitPayload(payload);
    });

    const blockErrors = vm.form.formState.errors.blocks ?? [];

    const getBlockError = (blockId: string) => {
        const index = vm.blocks.findIndex((block) => block.id === blockId);
        if (index === -1) return undefined;
        return blockErrors[index];
    };

    const getMainBlockNumber = (
        blockId: string,
        audience?: string,
    ): number => {
        const sameLineBlocks = mainBlocks.filter((item) => {
            if (audience === "creator") {
                return item.audience === "creator" || item.audience === "both";
            }

            if (audience === "community") {
                return item.audience === "community" || item.audience === "both";
            }

            if (audience === "both") {
                return item.audience === "both";
            }

            return false;
        });

        const index = sameLineBlocks.findIndex((item) => item.id === blockId);
        return index + 1;
    };

    const getMusicBlockNumber = (
        blockId: string,
        platform: string,
    ): number => {
        const samePlatformBlocks = musicBlocks.filter(
            (item) => item.platform === platform,
        );

        const index = samePlatformBlocks.findIndex((item) => item.id === blockId);
        return index + 1;
    };

    const pageTitle = React.useMemo(() => {
        const hasMain = mainBlocks.length > 0;
        const hasMusic = musicBlocks.length > 0;
        const hasPress = pressBlocks.length > 0;

        if (hasMain && !hasMusic && !hasPress) return "Post this content";
        if (!hasMain && hasMusic && !hasPress) return "Submit this content";
        if (!hasMain && !hasMusic && hasPress) return "Review this content";

        return "Review your campaign content";
    }, [mainBlocks.length, musicBlocks.length, pressBlocks.length]);

    return (
        <FormProvider {...vm.form}>
            <form className={styles.root} onSubmit={submit}>
                <div className={styles.row}>
                    <div className={styles.formBlock}>
                        <div className={styles.formSticky}>
                            <div className={styles.header}>
                                <h1>{pageTitle}</h1>
                            </div>

                            <div className={styles.formField}>
                                <label
                                    htmlFor="campaignName"
                                    className={
                                        vm.form.formState.errors.campaignName
                                            ? styles.labelError
                                            : ""
                                    }
                                >
                                    Campaign Name
                                </label>

                                <input
                                    id="campaignName"
                                    {...vm.form.register("campaignName")}
                                    className={
                                        vm.form.formState.errors.campaignName
                                            ? styles.inputError
                                            : ""
                                    }
                                    placeholder="Enter campaign name"
                                />

                                {vm.form.formState.errors.campaignName && (
                                    <p className={styles.errorText}>
                                        {vm.form.formState.errors.campaignName?.message as string}
                                    </p>
                                )}
                            </div>

                            {!!mainBlocks.length && (
                                <section className={styles.groupSection}>
                                    {mainBlocks.map((block) => {
                                        const blockIndex = vm.blocks.findIndex(
                                            (item) => item.id === block.id,
                                        );

                                        return (
                                            <CampaignPostContentBlockView
                                                key={block.id}
                                                block={block}
                                                accounts={accounts}
                                                title={
                                                    block.audience === "both"
                                                        ? `Post brief ${getMainBlockNumber(
                                                            block.id,
                                                            block.audience,
                                                        )} (for Creators & Communities)`
                                                        : block.audience === "creator"
                                                            ? `Post brief ${getMainBlockNumber(
                                                                block.id,
                                                                block.audience,
                                                            )} (for Creators)`
                                                            : block.audience === "community"
                                                                ? `Post brief ${getMainBlockNumber(
                                                                    block.id,
                                                                    block.audience,
                                                                )} (for Communities)`
                                                                : "Post brief"
                                                }
                                                errors={vm.form.formState.errors.blocks?.[blockIndex]}
                                                onChangeField={vm.onChangeField}
                                                onAddDescription={vm.onAddDescription}
                                                onRemoveDescription={vm.onRemoveDescription}
                                                onChangeDescription={vm.onChangeDescription}
                                                onRemoveBlock={vm.onRemoveBlock}
                                            />
                                        );
                                    })}

                                    <button
                                        type="button"
                                        className={styles.secondaryButton}
                                        onClick={vm.onAddMainAdditional}
                                    >
                                        Add additional post brief
                                    </button>

                                    {vm.mainChoiceOpen && (
                                        <div className={styles.choiceBox}>
                                            <p>Choose audience for additional post brief</p>

                                            <div className={styles.choiceActions}>
                                                <button
                                                    type="button"
                                                    className={styles.choiceButton}
                                                    onClick={() => vm.onChooseMainAdditional("creator")}
                                                >
                                                    <img src={plus} alt="" />
                                                    Creator
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.choiceButton}
                                                    onClick={() => vm.onChooseMainAdditional("community")}
                                                >
                                                    <img src={plus} alt="" />
                                                    Community
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {!!musicBlocks.length && (
                                <section className={styles.groupSection}>
                                    {musicBlocks.map((block) => (
                                        <CampaignPostContentBlockView
                                            key={block.id}
                                            block={block}
                                            errors={getBlockError(block.id)}
                                            accounts={accounts}
                                            title={
                                                block.isAdditional
                                                    ? `Additional song ${getMusicBlockNumber(
                                                        block.id,
                                                        block.platform,
                                                    )}`
                                                    : `Songs ${getMusicBlockNumber(
                                                        block.id,
                                                        block.platform,
                                                    )}`
                                            }
                                            onChangeField={vm.onChangeField}
                                            onAddDescription={vm.onAddDescription}
                                            onRemoveDescription={vm.onRemoveDescription}
                                            onChangeDescription={vm.onChangeDescription}
                                            onRemoveBlock={vm.onRemoveBlock}
                                        />
                                    ))}

                                    <button
                                        type="button"
                                        className={styles.secondaryButton}
                                        onClick={vm.onAddMusicAdditional}
                                    >
                                        Add additional song
                                    </button>

                                    {vm.musicChoiceOpen && (
                                        <div className={styles.choiceBox}>
                                            <p>Choose platform for additional song</p>

                                            <div className={styles.choiceActions}>
                                                {vm.musicAddConfig.platforms.map((platform) => {
                                                    console.log(platform,'plaft')
                                                    return <button
                                                        key={platform}
                                                        type="button"
                                                        className={`${styles.choiceButton} ${styles.songOption}`}
                                                        onClick={() =>
                                                            vm.onChooseMusicAdditional(platform)
                                                        }
                                                    >
                                                        <img
                                                            src={
                                                                getSocialMediaIconPostContent(
                                                                    platform as TSocialMedia,
                                                                ) || ""
                                                            }
                                                            alt={platform}
                                                        />
                                                    </button>
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {!!pressBlocks.length && (
                                <section className={styles.groupSection}>
                                    {pressBlocks.map((block) => (
                                        <CampaignPostContentBlockView
                                            key={block.id}
                                            block={block}
                                            accounts={accounts}
                                            errors={getBlockError(block.id)}
                                            title="Press form"
                                            onChangeField={vm.onChangeField}
                                            onAddDescription={vm.onAddDescription}
                                            onRemoveDescription={vm.onRemoveDescription}
                                            onChangeDescription={vm.onChangeDescription}
                                            onRemoveBlock={vm.onRemoveBlock}
                                        />
                                    ))}
                                </section>
                            )}

                            <div className={styles.submitSection}>
                                <button type="submit" className={styles.submitButton}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>

                    <CampaignPostContentSelection
                        currency={selectedCurrency}
                        accounts={accounts}
                        totalPrice={totalPrice}
                        onEditSelection={() => navigate(-1)}
                    />
                </div>
            </form>
        </FormProvider>
    );
};