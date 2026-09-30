export const formatCpm = (value: number) => {
  const v = value === null || value === undefined
      ? 0
      : value;

  return new Intl.NumberFormat("en", {
    useGrouping: false,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(v);
};
