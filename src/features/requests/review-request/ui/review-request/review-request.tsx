import React, { useState } from "react";
import { RequestDetailsModal } from "../request-details-modal/request-details-modal.tsx";
import type { IRequest } from "@/entities/requests";
import type { TRequestType } from "@/entities/requests/model/requests.types.ts";

import s from './review-request.module.scss';

type TSelectedRequest = Pick<IRequest, 'requestId' | 'type'>;

interface ReviewRequestProps {
  requestId: string;
  type: TRequestType;
}

export const ReviewRequest: React.FC<ReviewRequestProps> = ({
  requestId,
  type,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<TSelectedRequest | null>(null);

  return (
    <>
      <button
        type="button"
        className={s.reviewRequest}
        aria-label={`Review request ${type}`}
        onClick={() => {
          setSelectedRequest({
            requestId,
            type,
          })
        }}
      >
        Review
      </button>

      {selectedRequest && (
        <RequestDetailsModal
          requestId={selectedRequest.requestId}
          requestType={selectedRequest.type}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  );
};
