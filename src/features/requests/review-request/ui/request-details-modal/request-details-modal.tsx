import React, { useState } from "react";
import { type IRequest, useGetDetailsRequestQuery } from "@/entities/requests";
import { Modal } from "@/shared/ui/modal/modal.tsx";
import { RequestDetailsContent } from "@/widgets/requests";
import { NegotiateMessagesPanel } from "@/features/requests/request-negotiate";

import close from '@/assets/icons/x.svg';

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

  const shouldAutoOpen =
    request.specifiedStatus === 'NEGOTIATION' &&
    !isPending &&
    Boolean(data);

  const [openOverride, setOpenOverride] = useState<boolean | null>(null);

  const isOpen = openOverride ?? shouldAutoOpen;

  return (
    <Modal
      onClose={onClose}
      className={s.modal}
      contentClassName={s.dialog}
    >
      <div className={s.mainPanel}>
        <button
          className={s.closeButton}
          onClick={onClose}
          type="button"
          aria-label="Close modal"
        >
          <img
            className={s.closeIcon}
            src={close}
            alt="Close modal"
            width={24}
            height={24}
          />
        </button>

        {isPending && <div>Loading...</div>}

        {isError && (
          <div>Could not load request details. Please refresh the page.</div>
        )}

        {!isPending && !!data && (
          <RequestDetailsContent
            data={data}
            request={request}
            onCloseModal={onClose}
            onToggleNegotiatePanel={() => {
              setOpenOverride((currentOverride) => !(currentOverride ?? shouldAutoOpen));
            }}
          />
        )}
      </div>

      {isOpen && (
        <NegotiateMessagesPanel
          request={request}
          className={s.asidePanel}
          onClose={() => setOpenOverride(false)}
        />
      )}
    </Modal>
  );
};
