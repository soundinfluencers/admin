import React from "react";
import { RequestAnswer } from "@/features/requests/request-answer";
import { RequestSummary } from "@/widgets/requests/request-details-content/request-summary/request-summary.tsx";
import { PersonalInfo } from "./personal-info/personal-info.tsx";
import { AccountInfo } from "../ui/account-info/account-info.tsx";

import type { INewInfluencerRequestDetailsDto, IRequest } from "@/entities/requests/model/requests.types.ts";

import s from './new-influencer-request-details.module.scss';

interface NewInfluencerRequestDetailsProps {
  request: IRequest;
  data: INewInfluencerRequestDetailsDto;
  onCloseModal: () => void;
  onToggleNegotiatePanel: () => void;
}

export const NewInfluencerRequestDetails: React.FC<NewInfluencerRequestDetailsProps> = ({
  data,
  request,
  onCloseModal,
  onToggleNegotiatePanel,
}) => {
  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <RequestSummary data={request}/>

        <div className={s.content}>
          <PersonalInfo data={data}/>

          {data.accounts.map((account, index) => (
            <AccountInfo
              key={index}
              account={account}
            />
          ))}
        </div>
      </div>

      {request.lifecycleStatus === "OPEN" && (
        <RequestAnswer
          requestId={data.requestId}
          onCloseModal={onCloseModal}
          onToggleNegotiatePanel={onToggleNegotiatePanel}
        />
      )}
    </div>
  );
};
