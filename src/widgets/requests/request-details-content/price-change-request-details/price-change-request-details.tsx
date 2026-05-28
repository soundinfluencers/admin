import React from "react";
import { RequestSummary } from "@/widgets/requests/request-details-content/request-summary/request-summary.tsx";
import { RequestAnswer } from "@/features/requests/request-answer";
import { InfluencerInfo } from "@/widgets/requests/request-details-content/price-change-request-details/influencer-info/influencer-info.tsx";
import { AccountInfo } from "./account-info/account-info.tsx";
import type { IRequest } from "@/entities/requests";
import type { IPriceUpdateRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './price-change-request-details.module.scss';

interface PriceChangeRequestDetailsProps {
  request: IRequest;
  data: IPriceUpdateRequestDetailsDto;
  onCloseModal: () => void;
}

export const PriceChangeRequestDetails: React.FC<PriceChangeRequestDetailsProps> = ({
  request,
  data,
  onCloseModal,
}) => {
  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <RequestSummary data={request} />

        <div className={s.content}>
          <InfluencerInfo data={data}/>

          <AccountInfo data={data}/>
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
