export const formatCompactNumber = (
  value: number,
  suffix?: string
) => {
  const formatted = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);

  return suffix ? `${formatted}${suffix}` : formatted;
};
