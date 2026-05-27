import React from "react";
import { RequestAnswer } from "@/features/requests/request-answer";
import { RequestSummary } from "../request-summary/request-summary.tsx";
import { NEW_CLIENT_REQUEST_FIELDS } from "./new-client-request-details.config.ts";
import type { INewClientRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

import s from './new-client-request-details.module.scss';

interface NewClientRequestDetailsProps {
  data: INewClientRequestDetailsDto;
  onCloseModal: () => void;
}

export const NewClientRequestDetails: React.FC<NewClientRequestDetailsProps> = ({
  data,
  onCloseModal,
}) => {
  return (
    <div className={s.root}>
      <RequestSummary data={data}/>

      <div className={s.wrapper}>
        <ul className={s.fields}>
          {NEW_CLIENT_REQUEST_FIELDS.map((field) => (
            <li key={field.key} className={s.field}>
              <span className={s.label}>{field.label}</span>
              <span className={s.value}>{data[field.key] || "-"}</span>
            </li>
          ))}
        </ul>

        <RequestAnswer
          requestId={data.requestId}
          onCloseModal={onCloseModal}
        />
      </div>
    </div>
  );
};
