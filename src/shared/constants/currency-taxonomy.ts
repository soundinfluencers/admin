export const CURRENCY = {
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
} as const;

export type TCurrency = (typeof CURRENCY)[keyof typeof CURRENCY];

export const CURRENCIES: readonly TCurrency[] = Object.values(CURRENCY);

export const CURRENCY_LABELS = {
  [CURRENCY.EUR]: '\u20AC',
  [CURRENCY.USD]: '\u0024',
  [CURRENCY.GBP]: '\u00A3',
} satisfies Record<TCurrency, string>;

export const isCurrency = (value: string): value is TCurrency =>
  CURRENCIES.some((currency) => currency === value);
