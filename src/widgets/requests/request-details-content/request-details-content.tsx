import React from "react";
import { NewClientRequestDetails } from "./new-client-request-details/new-client-request-details.tsx";
import { BespokeCampaignRequestDetails } from "./bespoke-campaign-request-details/bespoke-campaign-request-details.tsx";
import { CampaignRequestDetails } from "./campaign-request-details/campaign-request-details.tsx";
import { PriceChangeRequestDetails } from "./price-change-request-details/price-change-request-details.tsx";
import { NewInfluencerRequestDetails } from "./new-influencer-request-details/ui/new-influencer-request-details.tsx";
import { NewSocialAccountRequestDetails } from "./new-social-account-request-details/ui/new-social-account-request-details.tsx";
import { NewBundleRequestDetails } from "./new-bundle-request-details/ui/new-bundle-request-details.tsx";
import type { IRequest, TAdminRequestDetails } from "@/entities/requests/model/requests.types.ts";

interface RequestDetailsContentProps {
  request: IRequest;
  data: TAdminRequestDetails;
  onCloseModal: () => void;
  onToggleNegotiatePanel: () => void;
}

export const RequestDetailsContent: React.FC<RequestDetailsContentProps> = ({
  request,
  data,
  onCloseModal,
  onToggleNegotiatePanel
}) => {
  switch (data.type) {
    case 'NEW_CLIENT_REQUEST':
      return (
        <NewClientRequestDetails
          request={request}
          data={data}
          onCloseModal={onCloseModal}
          onToggleNegotiatePanel={onToggleNegotiatePanel}

        />
      );

    case 'NEW_INFLUENCER_REQUEST':
      return (
        <NewInfluencerRequestDetails
          request={request}
          data={data}
          onCloseModal={onCloseModal}
          onToggleNegotiatePanel={onToggleNegotiatePanel}
        />
      );

    case 'CAMPAIGN_REQUEST':
      return (
        <CampaignRequestDetails
          request={request}
          data={data}
          onCloseModal={onCloseModal}
          onToggleNegotiatePanel={onToggleNegotiatePanel}
        />
      );

    case 'BESPOKE_CAMPAIGN_REQUEST':
      return (
        <BespokeCampaignRequestDetails
          request={request}
          data={data}
          onCloseModal={onCloseModal}
          onToggleNegotiatePanel={onToggleNegotiatePanel}
        />
      );

    // case 'PROPOSAL_CAMPAIGN_REQUEST':
    //   return <ProposalCampaignRequestDetails request={request} data={data} />;

    case 'NEW_SOCIAL_ACCOUNT_REQUEST':
      return (
        <NewSocialAccountRequestDetails
          request={request}
          data={data}
          onCloseModal={onCloseModal}
          onToggleNegotiatePanel={onToggleNegotiatePanel}
        />
      );

    case 'PRICE_UPDATE_REQUEST':
      return (
        <PriceChangeRequestDetails
          request={request}
          data={data}
          onCloseModal={onCloseModal}
          onToggleNegotiatePanel={onToggleNegotiatePanel}
        />
      );

    case "NEW_BUNDLE_REQUEST":
      return (
        <NewBundleRequestDetails
          request={request}
          data={data}
        />
      );

    default:
      return null;
  }
};
