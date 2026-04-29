import type { IDashboardNavItem } from "@/widgets/dashboard/dashboard-nav-section/model/types.ts";

import clientsList from '@/assets/icons/dashboard/clients-list.svg';
import campaigns from '@/assets/icons/dashboard/campaigns.svg';
import clientInvoices from '@/assets/icons/dashboard/client-invoices.svg';

import influencersList from '@/assets/icons/dashboard/influencers-list.svg';
import paymentHistory from '@/assets/icons/dashboard/payment-history.svg';
import influencersInvoices from '@/assets/icons/dashboard/influencers-invoices.svg';
import offers from '@/assets/icons/dashboard/offers.svg';


export const CLIENT_LINKS: IDashboardNavItem[] = [
  { label: "Clients List", to: "clients", icon: clientsList },
  { label: "Campaigns", to: "campaigns", icon: campaigns },
  { label: "Client Invoices", to: "client-invoices", icon: clientInvoices },
  { label: "Requests", to: "requests", icon: clientInvoices },
];

export const INFLUENCER_LINKS: IDashboardNavItem[] = [
  { label: "Influencer List", to: "influencers", icon: influencersList },
  { label: "Payment History", to: "payments-history", icon: paymentHistory },
  { label: "Influencer Invoices", to: "influencer-invoices", icon: influencersInvoices },
  { label: "Influencer History", to: "influencer-history", icon: influencersInvoices },
  { label: "Offers", to: "offers", icon: offers },
];
