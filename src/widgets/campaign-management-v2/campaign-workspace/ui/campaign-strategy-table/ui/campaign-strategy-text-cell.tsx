import * as Tooltip from "@radix-ui/react-tooltip";

import s from "./campaign-strategy-table.module.scss";

interface CampaignStrategyTextCellProps {
  value: string;
  width?: number;
}

export const CampaignStrategyTextCell = ({
  value,
  width = 130,
}: CampaignStrategyTextCellProps) => {
  if (!value.trim()) {
    return <>—</>;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span className={s.textCell} tabIndex={0} style={{ width }}>
          {value}
        </span>
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Content
          className={s.tooltip}
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={16}
        >
          {value}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
