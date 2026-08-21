// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from "react";
import styles from "./view-change.module.scss";
import edit from "./assets/edit.svg";
import proview from "./assets/Vector (15).svg";
import type { ViewMode } from "@/entities/campaign-managment/model/campaign-management-table.types";

interface Props {
  setView: React.Dispatch<React.SetStateAction<ViewMode>> | ((view: ViewMode) => void);
  view: ViewMode | null;
  isProposal?: boolean;
  canEdit?: boolean;
}

export const ViewChange: React.FC<Props> = ({
  setView,
  view,
  isProposal,
  canEdit,
}) => {
  const proposalTabs = [
    ...(canEdit
      ? [
        {
          label: "Edit View",
          icon: edit,
          value: -1 as ViewMode,
        },
      ]
      : []),
    {
      label: "Pro View",
      icon: proview,
      value: 0 as ViewMode,
    },
    // {
    //   label: "Live View",
    //   icon: liveview,
    //   value: 1 as ViewMode,
    // },
  ];

  const regularTabs = [
    {
      label: "Edit View",
      icon: edit,
      value: -1 as ViewMode,
    },
    // {
    //   label: "Live View",
    //   icon: liveview,
    //   value: 1 as ViewMode,
    // },
  ];

  const tabs = isProposal ? proposalTabs : regularTabs;

  const active = typeof view === "number" ? view : tabs[0]?.value ?? 0;

  const handleChangeView = (newView: ViewMode) => {
    setView(newView);
  };

  return (
    <div className={styles.changeViewTable}>
      <div className={styles.segmented}>
        {tabs.map((tab) => (
          <div
            key={tab.label}
            className={
              active === tab.value
                ? `${styles.item} ${styles.active}`
                : styles.item
            }
            onClick={() => handleChangeView(tab.value)}
            role="button"
            tabIndex={0}
          >
            <img src={tab.icon} alt={tab.label}/>
          </div>
        ))}
      </div>
    </div>
  );
};
