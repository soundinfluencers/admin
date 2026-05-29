import React from "react";
import { RequestAnswer } from "@/features/requests/request-answer";
import { RequestSummary } from "@/widgets/requests/request-details-content/request-summary/request-summary.tsx";
import { PersonalInfo } from "./personal-info/personal-info.tsx";
import { AccountInfo } from "./account-info/account-info.tsx";

import type { INewInfluencerAccountRequestDetailsDto, IRequest } from "@/entities/requests/model/requests.types.ts";

import s from './new-social-account-request-details.module.scss';

interface NewSocialAccountRequestDetailsProps {
  request: IRequest;
  data: INewInfluencerAccountRequestDetailsDto;
  onCloseModal: () => void;
}

export const NewSocialAccountRequestDetails: React.FC<NewSocialAccountRequestDetailsProps> = ({
  data,
  request,
  onCloseModal,
}) => {
  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <RequestSummary data={request}/>

        <div className={s.content}>
          <PersonalInfo data={data}/>

          <AccountInfo account={data.accountDetails}/>
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
