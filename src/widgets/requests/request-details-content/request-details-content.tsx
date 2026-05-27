import React from "react";
import { NewClientRequestDetails } from "./new-client-request-details/new-client-request-details.tsx";
import { BespokeCampaignRequestDetails } from "./bespoke-campaign-request-details/bespoke-campaign-request-details.tsx";
import type { TAdminRequestDetails } from "@/entities/requests/model/requests.types.ts";

interface RequestDetailsContentProps {
  data: TAdminRequestDetails;
  onCloseModal: () => void;
}

export const RequestDetailsContent: React.FC<RequestDetailsContentProps> = ({
  data,
  onCloseModal,
}) => {
  switch (data.type) {
    case 'NEW_CLIENT_REQUEST':
      return <NewClientRequestDetails data={data} onCloseModal={onCloseModal}/>;

    // case 'NEW_INFLUENCER_REQUEST':
    //   return <NewInfluencerRequestDetails data={data} />;
    //
    // case 'CAMPAIGN_REQUEST':
    //   return <CampaignRequestDetails data={data} />;
    //
    case 'BESPOKE_CAMPAIGN_REQUEST':
      return <BespokeCampaignRequestDetails data={data} onCloseModal={onCloseModal}/>;
    // case 'PROPOSAL_CAMPAIGN_REQUEST':
    //   return <ProposalCampaignRequestDetails data={data} />;
    //
    // case 'NEW_SOCIAL_ACCOUNT_REQUEST':
    //   return <NewSocialAccountRequestDetails data={data} />;
    //
    // case 'PRICE_UPDATE_REQUEST':
    //   return <PriceUpdateRequestDetails data={data} />;

    default:
      return null;
  }
};
