import React from "react";
import clsx from "clsx";
import { NegotiateForm } from "@/features/requests/request-negotiate";
import { useGetNegotiateQuery } from "@/entities/request-negotiate/api/negotiate.queries.ts";
import type { TRequestSpecifiedStatus, TRequestType } from "@/entities/requests/model/requests.types.ts";

import close from "@/assets/icons/x.svg";

import s from './negotiate-messages-panel.module.scss';

interface NegotiateMessagesPanelProps {
  requestId: string;
  requestStatus: TRequestSpecifiedStatus;
  requestType: TRequestType;
  onClose?: () => void;
  className?: string;
}

const canSendNegotiationMessage = (status: TRequestSpecifiedStatus) => {
  return status === "WAITING_FOR_ADMIN" || status === "NEGOTIATION";
};

export const NegotiateMessagesPanel: React.FC<NegotiateMessagesPanelProps> = ({
  requestId,
  requestStatus,
  requestType,
  onClose,
  className = "",
}) => {
  const isNegotiation = requestStatus === "NEGOTIATION";
  const canSendMessage = canSendNegotiationMessage(requestStatus);

  const { data, isLoading, isFetching, isError } = useGetNegotiateQuery({
    requestId,
    requestStatus,
  });

  const messages = data?.messages ?? [];

  const shouldShowCreateState = requestStatus === "WAITING_FOR_ADMIN";

  const shouldShowInitialMessagesLoading =
    isNegotiation && isLoading && !data;

  const shouldShowMessagesError =
    isNegotiation && isError && !data;

  const shouldShowMessages =
    isNegotiation && messages.length > 0;

  const shouldShowEmptyMessages =
    isNegotiation && !!data && messages.length === 0;

  const shouldShowMessagesRefreshing =
    isNegotiation && isFetching && !!data;

  return (
    <div className={clsx(s.root, className)}>
      <button
        className={s.closeButton}
        onClick={onClose}
        type="button"
        aria-label="Close panel"
      >
        <img
          className={s.closeIcon}
          src={close}
          alt="Close panel"
          width={24}
          height={24}
        />
      </button>

      <div className={s.messagesArea}>
        {shouldShowCreateState && (
          <div className={s.emptyState}>
            Start negotiation by sending a message.
          </div>
        )}

        {shouldShowInitialMessagesLoading && (
          <div className={s.messagesLoader}>
            Loading messages...
          </div>
        )}

        {shouldShowMessagesError && (
          <div className={s.error}>
            Something went wrong while loading messages. Please try again later.
          </div>
        )}

        {shouldShowEmptyMessages && (
          <div className={s.emptyState}>
            No messages yet.
          </div>
        )}

        {shouldShowMessages && (
          <ul className={s.list}>
            {messages.map((message) => {
              const isOutbound = message.direction === "OUTBOUND";
              const isInbound = message.direction === "INBOUND";

              return (
                <li key={message._id} className={s.message}>
                  {isOutbound && (
                    <span className={clsx(s.badge, s.badgeOut)}>
                      A
                    </span>
                  )}

                  <div
                    className={clsx(s.field)}
                  >
                    {message.bodyText}
                  </div>

                  {isInbound && (
                    <span className={clsx(s.badge, s.badgeIn)}>
                      U
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {shouldShowMessagesRefreshing && (
          <div className={s.refreshing}>
            Updating messages...
          </div>
        )}
      </div>

      {canSendMessage && (
        <NegotiateForm
          requestId={requestId}
          requestStatus={requestStatus}
          requestType={requestType}
        />
      )}
    </div>
  );
};
