import React, { useState } from "react";
import clsx from "clsx";
import { useNewInfluencerResponseMutation, useRequestAnswerMutation } from "../model/use-request-answer-mutation.ts";
import { Button } from "@/shared/ui";
import type { TRequestType, TResponse } from "@/entities/requests/model/requests.types.ts";

import s from './request-answer.module.scss';

interface CommonRequestAnswerProps {
  requestId: string;
  onCloseModal: () => void;
  onToggleNegotiatePanel: () => void;
}

type RequestAnswerProps =
  | (CommonRequestAnswerProps & {
  requestType: "NEW_INFLUENCER_REQUEST";
  selectedAccountIds: Set<string>;
  isPartialApprove: boolean;
})
  | (CommonRequestAnswerProps & {
  requestType: Exclude<TRequestType, "NEW_INFLUENCER_REQUEST">;
  selectedAccountIds?: never;
  isPartialApprove?: never;
});

export const RequestAnswer: React.FC<RequestAnswerProps> = props => {
  const {
    requestId,
    onCloseModal,
    onToggleNegotiatePanel,
  } = props;

  const [pendingAction, setPendingAction] =
    useState<TResponse | null>(null);

  const mutation = useRequestAnswerMutation();
  const newInfluencerResponseMutation =
    useNewInfluencerResponseMutation();

  const isPending =
    mutation.isPending ||
    newInfluencerResponseMutation.isPending;

  const handleAnswer = (response: TResponse) => {
    setPendingAction(response);

    const handleSettled = () => setPendingAction(null);
    const handleSuccess = () => onCloseModal();


    if (props.requestType !== "NEW_INFLUENCER_REQUEST") {
      mutation.mutate(
        {
          requestId,
          response,
        },
        {
          onSettled: handleSettled,
          onSuccess: handleSuccess,
        }
      );

      return;
    }

    const newInfluencerResponse =
      response === "APPROVE" && props.isPartialApprove
        ? "APPROVE_SELECTED"
        : response;

    newInfluencerResponseMutation.mutate(
      {
        requestId,
        response: newInfluencerResponse,
        approvedAccountIds: [...props.selectedAccountIds],
      },
      {
        onSettled: handleSettled,
        onSuccess: handleSuccess,
      },
    );
  };

  const isApproveDisabled =
    isPending ||
    (
      props.requestType === "NEW_INFLUENCER_REQUEST" &&
      props.selectedAccountIds.size === 0
    );

  return (
    <div className={s.cta}>
      <Button
        type="button"
        size="large"
        className={clsx(s.btn, s.approve)}
        onClick={() => handleAnswer("APPROVE")}
        disabled={isApproveDisabled}
      >
        {pendingAction === "APPROVE"
          ? "Approving..."
          : "Approve"}
      </Button>

      <Button
        type="button"
        size="large"
        className={clsx(s.btn, s.reject)}
        onClick={() => handleAnswer("REJECT")}
        disabled={isPending}
      >
        {pendingAction === "REJECT"
          ? "Rejecting..."
          : "Reject"}
      </Button>

      <Button
        type="button"
        size="large"
        className={clsx(s.btn, s.negotiate)}
        onClick={onToggleNegotiatePanel}
        disabled={isPending}
      >
        Negotiate
      </Button>
    </div>
  );
};
