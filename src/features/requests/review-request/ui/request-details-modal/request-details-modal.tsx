import React from "react";
import { useGetDetailsRequestQuery } from "@/entities/requests";
import { Modal } from "@/shared/ui/modal/modal.tsx";
import { RequestDetailsContent } from "@/widgets/requests";
import type { TRequestType } from "@/entities/requests/model/requests.types.ts";

import s from './request-details-modal.module.scss';

interface RequestDetailsModalProps {
  requestId: string;
  requestType: TRequestType;
  onClose: () => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  requestId,
  requestType,
  onClose,
}) => {
  const { data, isPending, isError } = useGetDetailsRequestQuery({
    requestId,
    requestType,
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
        <RequestDetailsContent data={data} onCloseModal={onClose}/>
      )}
    </Modal>
  );
};
