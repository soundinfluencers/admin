import React, { useState } from "react";
import { RequestAnswer } from "@/features/requests/request-answer";
import { RequestSummary } from "@/widgets/requests/request-details-content/request-summary/request-summary.tsx";
import { PersonalInfo } from "./personal-info/personal-info.tsx";
import { AccountInfo } from "../ui/account-info/account-info.tsx";

import type { INewInfluencerRequestDetailsDto, IRequest } from "@/entities/requests/model/requests.types.ts";

import s from './new-influencer-request-details.module.scss';

interface NewInfluencerRequestDetailsProps {
  request: IRequest;
  data: INewInfluencerRequestDetailsDto;
  onCloseModal: () => void;
  onToggleNegotiatePanel: () => void;
}

export const NewInfluencerRequestDetails: React.FC<NewInfluencerRequestDetailsProps> = ({
  data,
  request,
  onCloseModal,
  onToggleNegotiatePanel,
}) => {
  const accountIds = data.accounts.map(account => account.accountId);

  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(() => new Set(accountIds));

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccountIds((prevState) => {
      const next = new Set(prevState);

      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }

      return next;
    });
  };

  const isRequestOpen = request.lifecycleStatus === "OPEN";

  return (
    <div className={s.root}>
      <div className={s.wrapper}>
        <RequestSummary data={request}/>

        <div className={s.content}>
          <PersonalInfo data={data}/>

          {data.accounts.map((account) => (
            <AccountInfo
              key={account.accountId}
              account={account}
              requestId={request.requestId}
              requestType={request.type}
              selectedAccount={selectedAccountIds.has(account.accountId)}
              onSelectedAccountChange={toggleAccountSelection}
              isRequestOpen={isRequestOpen}
            />
          ))}
        </div>
      </div>

      {isRequestOpen && (
        <RequestAnswer
          requestId={data.requestId}
          requestType={"NEW_INFLUENCER_REQUEST"}
          isPartialApprove={selectedAccountIds.size < data.accounts.length}
          selectedAccountIds={selectedAccountIds}
          onCloseModal={onCloseModal}
          onToggleNegotiatePanel={onToggleNegotiatePanel}
        />
      )}
    </div>
  );
};
