import React from "react";
import { CloseRequest } from "@/features/requests/close-request";
import { RequestSummary } from "@/widgets/requests/request-details-content/request-summary/request-summary.tsx";
import { PersonalInfo } from './personal-info/personal-info.tsx';
import { AccountInfo } from "./account-info/account-info.tsx";
import type { INewBundleRequestDetailsDto, IRequest } from "@/entities/requests/model/requests.types.ts";

import s from './new-bundle-request-details.module.scss';

interface NewBundleRequestDetailsProps {
  request: IRequest;
  data: INewBundleRequestDetailsDto;
  // onCloseModal: () => void;
  // onToggleNegotiatePanel: () => void;
}

export const NewBundleRequestDetails: React.FC<NewBundleRequestDetailsProps> = ({
  data,
  request,
  // onCloseModal,
  // onToggleNegotiatePanel,
}) => {
  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <RequestSummary data={request}/>

        <div className={s.content}>
          <PersonalInfo data={data}/>

          <AccountInfo accounts={data.accounts}/>
        </div>
      </div>

      {request.lifecycleStatus === "OPEN" && (
        <CloseRequest requestId={request.requestId}/>
      )}
    </div>
  );
};
