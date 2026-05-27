import React from "react";
import { RequestAnswer } from "@/features/requests/request-answer";
import type { IBespokeCampaignRequestDetailsDto } from "@/entities/requests/model/requests.types.ts";

interface BespokeCampaignRequestDetailsProps {
  data: IBespokeCampaignRequestDetailsDto;
  onCloseModal: () => void;
}

export const BespokeCampaignRequestDetails: React.FC<BespokeCampaignRequestDetailsProps> = ({
  data,
  onCloseModal,
}) => {
  return (
    <div>

      <pre>{JSON.stringify(data, null, 2)}</pre>

      <RequestAnswer
        requestId={data.requestId}
        onCloseModal={onCloseModal}
      />
    </div>
  );
};
