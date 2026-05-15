import email from '@/assets/icons/invoice/mail.svg';
import phone from '@/assets/icons/invoice/phone.svg';

import bank from '@/assets/icons/invoice/bank.svg';
import creditCard from '@/assets/icons/invoice/credit-card.svg';
import paypal from '@/assets/icons/invoice/paypal.svg'

export type TMethod = "bankTransfer" | "cardPayments" | "paypal";

export const STATIC_COMPANY_INFO = [
  { type: "text", text: "Techno TV Ltd." },
  { type: "text", text: "124 City Road" },
  { type: "text", text: "London, EC1V 2NX" },
  { type: "text", text: "United Kingdom" },
  { type: "text", text: "Company No: 10458319" },

  {
    type: "contact",
    icon: email,
    label: "Email:",
    value: "admin@soundinfluencers.com",
  },
  {
    type: "contact",
    icon: phone,
    label: "Phone:",
    value: "+44 7537 129190",
  },
] as const satisfies (| { type: "text"; text: string }
  | { type: "contact"; icon: string; label: string; value: string }
  )[];


export const STATIC_PAYMENT_METHODS = {
  bankTransfer: {
    title: "Bank Transfer",
    icon: bank,
    fields: [
      { label: "Recipient:", value: "TECHNO TV LTD" },
      {
        label: "Recipient address:",
        value: "124 City Road, City Road, EC1V 2NX, London, United Kingdom",
      },
    ],
  },

  cardPayments: {
    title: "Card Payments",
    icon: creditCard,
    fields: [
      { label: "Revolut link:", value: "https://revolut.me/technotvltd" },
    ],
  },

  paypal: {
    title: "Paypal",
    icon: paypal,
    fields: [
      { label: "Paypal Email:", value: "admin@soundinfluencers.com" },
    ],
  },
} as const satisfies Record<
  TMethod,
  {
    title: string;
    icon: string;
    fields: {
      label: string;
      value: string;
    }[];
  }
>;

export const STATIC_PAYMENT_INFO_CARDS = [
  {
    title: "USA",
    fields: [
      { label: "Account number:", value: "210854303917" },
      { label: "Routing number:", value: "101019644" },
    ],
  },
  {
    title: "UK",
    fields: [
      { label: "Account number:", value: "17299128" },
      { label: "Sort code:", value: "04-00-75" },
    ],
  },
  {
    title: "EU / International ",
    fields: [
      { label: "IBAN:", value: "GB47REVO00996994280983" },
      { label: "BIC:", value: "REVOGB21" },
    ],
  },
] as const satisfies {
  title: string;
  fields: {
    label: string;
    value: string;
  }[];
}[];
