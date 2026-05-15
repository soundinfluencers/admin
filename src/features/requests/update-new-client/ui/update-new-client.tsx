import React from "react";
import { Button } from "@/shared/ui";
import {
  useUpdateNewClientRequestMutation,
} from "@/features/requests/update-new-client/model/use-update-new-client-mutation.ts";

import s from './update-new-client.module.scss';

interface UpdateNewClientProps {
  requestId: string;
}

export const UpdateNewClient: React.FC<UpdateNewClientProps> = ({
  requestId,
}) => {
  const acceptMutation = useUpdateNewClientRequestMutation();
  const declineMutation = useUpdateNewClientRequestMutation();

  return (
    <div className={s.wrapper}>
      <h2 className={s.title}>Do you want to verify this account?</h2>
      <div className={s.cta}>
        <Button
          type="button"
          size="large"
          variant="primary"
          onClick={() =>
            acceptMutation.mutate({
              requestId,
              response: 'accept',
            })}
          disabled={acceptMutation.isPending || declineMutation.isPending}
        >
          {acceptMutation.isPending ? "Accepting..." : "Accept"}
        </Button>

        <Button
          type="button"
          size="large"
          variant="secondary"
          onClick={() =>
            declineMutation.mutate({
              requestId,
              response: 'decline',
            })}
          disabled={acceptMutation.isPending || declineMutation.isPending}
        >
          {declineMutation.isPending ? "Processing..." : "Decline"}
        </Button>
      </div>
    </div>
  );
}
