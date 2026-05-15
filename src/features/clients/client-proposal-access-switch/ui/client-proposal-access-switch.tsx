import React from "react";
import { useUpdateClientMutation } from "@/entities/client/api/use-update-client-mutation.ts";
import { Switch, SwitchThumb } from "@radix-ui/react-switch";
import { toast } from "react-toastify";
import type { TClientDetailsEditableKey } from "@/features/clients/model/types.ts";

import s from './client-proposal-access-switch.module.scss';

interface ClientProposalAccessSwitchProps {
  value: boolean;
  clientId: string;
  fieldKey: TClientDetailsEditableKey;
}

export const ClientProposalAccessSwitch: React.FC<ClientProposalAccessSwitchProps> = ({ value, clientId, fieldKey }) => {
  const { mutate, isPending } = useUpdateClientMutation();

  const handleToggleProposalAccess = (newValue: boolean) => {
    mutate({
      clientId,
      dto: {
        [fieldKey]: newValue,
      }
    },
    {
      onSuccess: () => {
        toast(`Client proposal access was successfully ${newValue ? 'enabled' : 'disabled'}!`,
          { type: "success", position: "top-right", autoClose: 3000 });
      },
    });
  }

  return (
    <div className={s.root}>
      <span className={s.label}>{value ? 'Enabled' : 'Disabled'}</span>

      <Switch
        className={s.switchRoot}
        checked={value}
        onCheckedChange={handleToggleProposalAccess}
        disabled={isPending}
      >
        <SwitchThumb className={s.switchThumb} />
      </Switch>
    </div>
  );
};
