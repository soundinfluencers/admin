import React from "react";
import { RequestAnswer } from "@/features/requests/request-answer";
import { RequestSummary } from "../request-summary/request-summary.tsx";
import { NEW_CLIENT_REQUEST_FIELDS } from "./new-client-request-details.config.ts";
import type { IRequest, INewClientRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './new-client-request-details.module.scss';

interface NewClientRequestDetailsProps {
  request: IRequest;
  data: INewClientRequestDetailsDto;
  onCloseModal: () => void;
  onToggleNegotiatePanel: () => void;
}

export const NewClientRequestDetails: React.FC<NewClientRequestDetailsProps> = ({
  request,
  data,
  onCloseModal,
  onToggleNegotiatePanel,
}) => {
  return (
    <div className={s.root}>
      <RequestSummary data={request}/>

      <div className={s.wrapper}>
        <ul className={s.fields}>
          {NEW_CLIENT_REQUEST_FIELDS.map((field) => (
            <li key={field.key} className={s.field}>
              <span className={s.label}>{field.label}</span>
              <span className={s.value}>{data[field.key] || "N/A"}</span>
            </li>
          ))}
        </ul>

        {request.lifecycleStatus === "OPEN" && (
          <RequestAnswer
            requestId={data.requestId}
            requestType={"NEW_CLIENT_REQUEST"}
            onCloseModal={onCloseModal}
            onToggleNegotiatePanel={onToggleNegotiatePanel}
          />
        )}
      </div>
    </div>
  );
};
