import React, { useState } from "react";
import clsx from "clsx";
import { useRequestAnswerMutation } from "../model/use-request-answer-mutation.ts";
import { Button } from "@/shared/ui";
import type { TResponse } from "@/entities/requests/model/requests.types.ts";

import s from './request-answer.module.scss';

interface RequestAnswerProps {
  requestId: string;
  onCloseModal: () => void;
  onToggleNegotiatePanel: () => void;
}

export const RequestAnswer: React.FC<RequestAnswerProps> = ({
  requestId,
  onCloseModal,
  onToggleNegotiatePanel,
}) => {
  const [pendingAction, setPendingAction] = useState<TResponse | null>(null);
  const mutation = useRequestAnswerMutation();

  const handleAnswer = (response: TResponse) => {
    setPendingAction(response);
    mutation.mutate(
      { requestId, response },
      {
        onSettled: () => setPendingAction(null),
        onSuccess: () => onCloseModal(),
      },
    );
  };

  return (
    <div className={s.cta}>
      <Button
        type="button"
        size="large"
        className={clsx(s.btn, s.approve)}
        onClick={() => handleAnswer('APPROVE')}
        disabled={mutation.isPending}
      >
        {pendingAction === 'APPROVE' ? "Approving..." : "Approve"}
      </Button>

      <Button
        type="button"
        size="large"
        className={clsx(s.btn, s.reject)}
        onClick={() => handleAnswer('REJECT')}
        disabled={mutation.isPending}
      >
        {pendingAction === 'REJECT' ? "Rejecting..." : "Reject"}
      </Button>

      <Button
        type="button"
        size="large"
        className={clsx(s.btn, s.negotiate)}
        onClick={onToggleNegotiatePanel}
      >
        Negotiate
      </Button>
    </div>
  );
}
