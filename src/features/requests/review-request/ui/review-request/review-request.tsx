import React, { useState } from "react";
import { RequestDetailsModal } from "../request-details-modal/request-details-modal.tsx";
import type { IRequest } from "@/entities/requests";

import s from './review-request.module.scss';

type TSelectedRequest = Pick<IRequest, 'requestId' | 'type'>;

interface ReviewRequestProps {
  request: IRequest;
}

export const ReviewRequest: React.FC<ReviewRequestProps> = ({
  request,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<TSelectedRequest | null>(null);

  return (
    <>
      <button
        type="button"
        className={s.reviewRequest}
        aria-label={`Review request ${request.type}`}
        onClick={() => {
          setSelectedRequest({
            requestId: request.requestId,
            type: request.type,
          })
        }}
      >
        Review
      </button>

      {selectedRequest && (
        <RequestDetailsModal
          request={request}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  );
};
