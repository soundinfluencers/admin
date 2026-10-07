export const formatCampaignDate = (dateString: string): string => {
  const [day, month, year] = dateString.split('.').map(Number);
  const fullYear = year < 100 ? 2000 + year : year;

  const date = new Date(fullYear, month - 1, day);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
