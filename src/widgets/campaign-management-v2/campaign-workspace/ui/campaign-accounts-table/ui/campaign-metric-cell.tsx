import { InlineIntegerInput } from "@/shared/ui/v2/inline-integer-input";

interface CampaignMetricCellProps {
  value: number;
  canEditMetrics: boolean;
  onApply: (value: number) => void;
  "aria-label": string;
}

export const CampaignMetricCell = ({
  value,
  canEditMetrics,
  onApply,
  "aria-label": ariaLabel,
}: CampaignMetricCellProps) => {
  if (!canEditMetrics) {
    return value;
  }

  return (
    <InlineIntegerInput
      value={value}
      onApply={onApply}
      aria-label={ariaLabel}
    />
  );
};
