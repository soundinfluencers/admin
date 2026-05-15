import { Link } from "react-router-dom";

import arrowUpRight from '@/assets/icons/arrow-up-right.svg';

import styles from './dashboard-quick-action.module.scss';
import {
    useCampaignBuilderStore
} from "@/entities/admin-create-campaign/campaign-builder/model/campaign-builder.store.ts";

export const DashboardQuickAction = () => {
    const reset = useCampaignBuilderStore((s) => s.actions.reset)
  return (
    <Link onClick={() => reset()} to="create-new-campaign" className={styles.action}>
      <span>Create a campaign</span>
      <div className={styles.icon}>
        <img
          src={arrowUpRight}
          alt="Create a campaign"
        />
      </div>
    </Link>
  );
};
