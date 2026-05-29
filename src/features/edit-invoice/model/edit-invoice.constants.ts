import type { FC, SVGProps } from "react";

import Email from '@/assets/icons/invoice/mail.svg?react';
import Phone from '@/assets/icons/invoice/phone.svg?react';
import Bank from '@/assets/icons/invoice/bank.svg?react';
import CreditCard from '@/assets/icons/invoice/credit-card.svg?react';
import PayPal from '@/assets/icons/invoice/paypal.svg?react';

export type TPaymentMethod = "bankTransfer" | "cardPayments" | "paypal";

export const STATIC_COMPANY_INFO = [
  { type: "text", text: "Techno TV Ltd." },
  { type: "text", text: "124 City Road" },
  { type: "text", text: "London, EC1V 2NX" },
  { type: "text", text: "United Kingdom" },
  { type: "text", text: "Company No: 10458319" },

  {
    type: "contact",
    icon: Email,
    label: "Email:",
    value: "admin@soundinfluencers.com",
  },
  {
    type: "contact",
    icon: Phone,
    label: "Phone:",
    value: "+44 7537 129190",
  },
] as const satisfies (| { type: "text"; text: string }
  | { type: "contact"; icon: FC<SVGProps<SVGSVGElement>>; label: string; value: string }
  )[];

export const STATIC_PAYMENT_METHODS = {
  bankTransfer: {
    title: "Bank Transfer",
    icon: Bank,
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
    icon: CreditCard,
    fields: [
      { label: "Revolut link:", value: "https://revolut.me/technotvltd" },
    ],
  },

  paypal: {
    title: "PayPal",
    icon: PayPal,
    fields: [
      { label: "PayPal Email:", value: "admin@soundinfluencers.com" },
    ],
  },
} as const satisfies Record<
  TPaymentMethod,
  {
    title: string;
    icon: FC<SVGProps<SVGSVGElement>>;
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
