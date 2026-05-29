export const invoiceFormatDate = (dateString: string): string => {
  const [day, month, year] = dateString.split('.').map(Number);
  const fullYear = year < 100 ? 2000 + year : year;

  const date = new Date(fullYear, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  const formatted = date.toLocaleDateString('en-GB', options);

  return formatted.replace(/(\d+) (\w+) (\d+)/, '$1 $2, $3');
}
