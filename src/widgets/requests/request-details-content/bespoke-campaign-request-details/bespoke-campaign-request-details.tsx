import React from "react";
import { RequestAnswer } from "@/features/requests/request-answer";
import { RequestSummary } from "@/widgets/requests/request-details-content/request-summary/request-summary.tsx";
import { BespokeCampaignInfo } from "./bespoke-campaign-info/bespoke-campaign-info.tsx";
import { PersonalInfo } from "./personal-info/personal-info.tsx";
import type { IRequest, IBespokeCampaignRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './bespoke-campaign-request-details.module.scss';

interface BespokeCampaignRequestDetailsProps {
  request: IRequest;
  data: IBespokeCampaignRequestDetailsDto;
  onCloseModal: () => void;
}

export const BespokeCampaignRequestDetails: React.FC<BespokeCampaignRequestDetailsProps> = ({
  data,
  request,
  onCloseModal,
}) => {
  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <RequestSummary data={request} />

        <div className={s.content}>
          <PersonalInfo data={data}/>

          <BespokeCampaignInfo data={data}/>
        </div>
      </div>
      
      {request.lifecycleStatus === "OPEN" && (
        <RequestAnswer
          requestId={data.requestId}
          onCloseModal={onCloseModal}
        />
      )}
    </div>
  );
};
