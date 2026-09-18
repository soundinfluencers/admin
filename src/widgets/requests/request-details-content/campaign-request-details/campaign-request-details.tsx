import React from "react";
import { RequestAnswer } from "@/features/requests/request-answer";
import { RequestSummary } from "@/widgets/requests/request-details-content/request-summary/request-summary.tsx";
import { PersonalInfo } from "./personal-info/personal-info.tsx";
import { CampaignInfo } from "./campaign-info/campaign-info.tsx";
import type { ICampaignRequestDetailsDto, IRequest } from "@/entities/requests/model/requests.types.ts";

import s from './campaign-request-details.module.scss';

interface CampaignRequestDetailsProps {
  request: IRequest;
  data: ICampaignRequestDetailsDto;
  onCloseModal: () => void;
  onToggleNegotiatePanel: () => void;
}

export const CampaignRequestDetails: React.FC<CampaignRequestDetailsProps> = ({
  data,
  request,
  onCloseModal,
  onToggleNegotiatePanel,
}) => {
  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <RequestSummary data={request} />

        <div className={s.content}>
          <PersonalInfo data={data}/>

          {data.items.map((item, index) => (
            <CampaignInfo
              key={`${item.socialMedia}:${item.mainLink}:${index}`}
              item={item}
            />
          ))}
        </div>
      </div>

      {request.lifecycleStatus === "OPEN" && (
        <RequestAnswer
          requestId={data.requestId}
          requestType={"CAMPAIGN_REQUEST"}
          onCloseModal={onCloseModal}
          onToggleNegotiatePanel={onToggleNegotiatePanel}
        />
      )}
    </div>
  );
};
