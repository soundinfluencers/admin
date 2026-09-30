import React from "react";

import { BuildCampaign } from "@/widgets/admin-create-campaign/build-campaign/ui/build-campaign";

import {PageBreadcrumbs} from "@/shared/ui/page-breadcrumbs";
import {FooterSummary} from "@/widgets/admin-create-campaign/footer-summary/ui/footer-summary.tsx";

export const AdminCreateCampaignPage: React.FC = () => {
    return (
        <div>
            <div style={{ margin: "32px 0" }}>
                <PageBreadcrumbs
                    items={[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: "Create campaign" },
                    ]}
                />
            </div>
            <BuildCampaign />
            <FooterSummary/>
        </div>
    );
};
