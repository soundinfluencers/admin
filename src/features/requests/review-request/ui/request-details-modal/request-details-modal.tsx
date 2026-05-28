import React from "react";
import { type IRequest, useGetDetailsRequestQuery } from "@/entities/requests";
import { Modal } from "@/shared/ui/modal/modal.tsx";
import { RequestDetailsContent } from "@/widgets/requests";

import s from './request-details-modal.module.scss';

interface RequestDetailsModalProps {
  request: IRequest;
  onClose: () => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  onClose,
}) => {
  const { data, isPending, isError } = useGetDetailsRequestQuery({
    requestId: request.requestId,
    requestType: request.type,
  });

  return (
    <Modal
      onClose={onClose}
      isShownCloseButton
      className={s.modal}
      contentClassName={s.content}
    >
      {isPending && <div>Loading...</div>}

      {isError && (
        <div>Could not load request details. Please refresh the page.</div>
      )}

      {!isPending && data && (
        <RequestDetailsContent
          data={data}
          request={request}
          onCloseModal={onClose}
        />
      )}
    </Modal>
  );
};
