export const formatCompactNumber = (
  value: number,
  floor?: boolean,
) => {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: floor ? 2 : undefined,
  }).format(value);
};
