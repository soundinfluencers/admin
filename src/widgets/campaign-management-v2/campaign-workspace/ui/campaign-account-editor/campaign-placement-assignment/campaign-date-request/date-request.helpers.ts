export type TDateRequestMode = "ASAP" | "AFTER" | "BEFORE";

type TParsedDateRequest = {
  mode: TDateRequestMode;
  date: string;
};

export const parseDateRequest = (
  value: string,
): TParsedDateRequest => {
  const fallback: TParsedDateRequest = {
    mode: "ASAP",
    date: "",
  };

  if (value === "ASAP") return fallback;

  const match = /^(AFTER|BEFORE):(\d{2})\.(\d{2})\.(\d{2})$/.exec(value);

  if (!match) return fallback;

  const [, prefix, day, month, shortYear] = match;

  if (prefix !== "AFTER" && prefix !== "BEFORE") {
    return fallback;
  }

  const year = 2000 + Number(shortYear);
  const monthNumber = Number(month);
  const dayNumber = Number(day);

  if (monthNumber < 1 || monthNumber > 12) {
    return fallback;
  }

  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  if (dayNumber < 1 || dayNumber > daysInMonth) {
    return fallback;
  }

  return {
    mode: prefix,
    date: `${year}-${month}-${day}`,
  };
};

export const formatDateRequest = (
  mode: TDateRequestMode,
  date: string,
): string => {
  if (mode === "ASAP" || !date) return "ASAP";

  const match = /^(20\d{2})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) return "ASAP";

  const [, year, month, day] = match;

  return `${mode}:${day}.${month}.${year.slice(-2)}`;
};
