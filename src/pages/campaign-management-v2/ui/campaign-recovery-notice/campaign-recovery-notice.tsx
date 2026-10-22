import type { ReactNode } from "react";

import s from "./campaign-recovery-notice.module.scss";

interface CampaignRecoveryNoticeProps {
  role: "alert" | "status";
  title: string;
  description: ReactNode;
  action: ReactNode;
}

export const CampaignRecoveryNotice = ({
  role,
  title,
  description,
  action,
}: CampaignRecoveryNoticeProps) => (
  <div className={s.notice} role={role}>
    <div className={s.message}>
      <p className={s.title}>{title}</p>
      <p className={s.description}>{description}</p>
    </div>

    {action}
  </div>
);
