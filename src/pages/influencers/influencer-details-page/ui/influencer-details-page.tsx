import { useParams } from "react-router-dom";
import { useInfluencerQuery } from "@/entities/influencers/api/use-influencer-query.ts";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { PageTitle } from "@/widgets/page-title";
import { InfluencerAccountDetails } from "@/widgets/influencers/influencer-account-details";
import { InfluencerSocialAccounts } from "@/widgets/influencers/social-accounts-list";
import { DeleteInfluencer } from "@/features/influencers/delete-influencer";
import { mapInfluencerProfileToAccounts } from "../model/influencer-social-accounts.mapper.ts";

import s from './influencer-details-page.module.scss';

export const InfluencerDetailsPage = () => {
  const { influencerId } = useParams();

  const { data, isPending, isError } = useInfluencerQuery(influencerId);

  const accountsDetails = data ? mapInfluencerProfileToAccounts(data) : null;

  if (!influencerId) {
    return <div>Influencer id is missing.</div>;
  }

  if (isPending && !data) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading influencer. Please try again later.</div>;
  }

  if (!data || !accountsDetails) {
    return <div>Influencer not found.</div>;
  }

  return (
    <div className={s.influencerDetailsPage}>
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Influencers list", to: "/dashboard/influencers" },
          { label: "Account details" },
        ]}
      />

      <PageTitle
        title={data.email}
      />

      <InfluencerAccountDetails
        influencerId={influencerId}
        details={data}
      />

      <InfluencerSocialAccounts details={accountsDetails}/>

      <DeleteInfluencer influencerId={influencerId}/>
    </div>
  );
};
