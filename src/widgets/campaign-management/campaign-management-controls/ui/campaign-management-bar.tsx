//@ts-nocheck
import styles from "./campaign-management-bar.module.scss";

import { StrategyBar } from "@/widgets/campaign-management/campaign-management-controls/ui/bars/strategy-bar.tsx";
import { InsightBar } from "@/widgets/campaign-management/campaign-management-controls/ui/bars/insight-bar.tsx";
import {
  OptionsSlider,
} from "@/widgets/campaign-management/campaign-management-controls/ui/option-slider/option-slider.tsx";
import { ViewChange } from "@/widgets/campaign-management/campaign-management-controls/ui/view-change/view-change.tsx";
import type { ViewMode } from "@/entities/campaign-managment/model/campaign-management-table.types";
import { ShareLink } from "@/widgets/campaign-management/campaign-management-controls/ui/share-link/share-link.tsx";
import {
  ViewAudience,
} from "@/widgets/campaign-management/campaign-management-controls/ui/view-audience/view-audience.tsx";
import {
  AddinitonalOption,
} from "@/widgets/campaign-management/campaign-management-controls/ui/additional-option/additional-options.tsx";
import { ToggleTables } from "@/features/campaign-management-add-accounts/toggle-table/ui/toggle-table.tsx";
import type { EditableCampaign } from "@/entities/campaign-managment/store/campaign-management.store.ts";

import confirm from "./assets/check-circle (2).svg";
import reset from "./assets/x.svg";

type Props = {
  status?: string | null;
  view: ViewMode;
  setView: React.Dispatch<React.SetStateAction<ViewMode>> | ((view: ViewMode) => void);
  changeView: boolean;
  setChangeView: React.Dispatch<React.SetStateAction<boolean>> | ((value: boolean) => void);
  canEdit?: boolean;
  handleSave?: () => Promise<void>;
  resetCampaign: () => void;
  activeOption: number;
  optionIndexes: number[] | undefined;
  onChangeOption: (optionIndex: number) => void;
  campaign: EditableCampaign | null;
  campaignId: string;
  socialMedia?: string;
  kind: string;
  insightMode: boolean;
  setInsightMode: () => void;
  onAddOption?: () => void;
  onDeleteOption?: (optionIndex: number) => void;
};

const STRATEGY_STATUSES = ["proposal"] as const;
const INSIGHT_STATUSES = ["completed", "distributing", "pending", "under_review"] as const;

export const CampaignManagementBar = ({
  status,
  view,
  setView,
  changeView,
  setChangeView,
  activeOption,
  onChangeOption,
  optionIndexes,
  canEdit = false,
  handleSave,
  resetCampaign,
  campaignId,
  socialMedia,
  kind,
  insightMode,
  setInsightMode,
  campaign,
  onAddOption, onDeleteOption,
}: Props) => {
  const normalizedStatus = String(status ?? "").toLowerCase();

  const isProposal = normalizedStatus === "proposal";
  const isLockedStatus = INSIGHT_STATUSES.includes(normalizedStatus);

  const isStrategyBar = STRATEGY_STATUSES.includes(
    normalizedStatus as (typeof STRATEGY_STATUSES)[number],
  );

  const isInsightBar = INSIGHT_STATUSES.includes(
    normalizedStatus as (typeof INSIGHT_STATUSES)[number],
  );

  const renderBar = () => {
    if (isStrategyBar) {
      return (
        <StrategyBar
          status={normalizedStatus}
          isLockedStatus={isLockedStatus}
          campaign={campaign}
        />
      );
    }

    if (isInsightBar) {
      return <InsightBar campaign={campaign}/>;
    }

    return null;
  };

  return (
    <div className={styles.bar}>
      {renderBar()}

      <div className={styles.barControls}>
        {isProposal ? (
          view === 0 || view === 1 ? (
            <div className={styles.controlsProposal}>
              <OptionsSlider
                optionIndexes={optionIndexes}
                activeOption={activeOption}
                onChangeOption={onChangeOption}
              />
            </div>
          ) : (
            <div className={`${styles.controlsProposal} ${styles.edit}`}>
              <div className={styles.controlsProposal__left}>
                <AddinitonalOption onClick={onAddOption ?? (() => {
                })}/>

                <OptionsSlider
                  onDeleteOption={onDeleteOption}
                  optionIndexes={optionIndexes}
                  activeOption={activeOption}
                  onChangeOption={onChangeOption}
                  className={styles.nonEdit}
                />
              </div>

              <div className={styles.barSave}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={handleSave}
                >
                  <img src={confirm} alt=""/>
                  Save
                </button>

                <button
                  type="button"
                  className={styles.button}
                  onClick={resetCampaign}
                >
                  <img src={reset} alt=""/>
                  Reset
                </button>
              </div>
            </div>
          )
        ) : null}

        <div className={styles.tableControls}>
          {isLockedStatus && (
            <ToggleTables
              flag={insightMode}
              onChange={setInsightMode}
            />
          )}

          {!isLockedStatus && normalizedStatus !== "under_review" && (
            <ViewAudience
              flag={changeView}
              onChange={() => setChangeView((prev) => !prev)}
            />
          )}

          <ViewChange
            isProposal={isProposal}
            setView={setView}
            view={view}
            canEdit={canEdit}
          />

          <ShareLink
            campaignId={campaignId}
            kind={kind}
            socialMedia={socialMedia}
          />
        </div>
      </div>
    </div>
  );
};
