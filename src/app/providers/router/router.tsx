import { createBrowserRouter, Outlet } from "react-router-dom";
import { RootRedirect } from "./root-redirect.tsx";
import { ProtectedOnly, PublicOnly } from "./guards.tsx";
import { PublicLayout } from "@/app/providers/router/ui/public-layout.tsx";
import { AdminLayout } from "@/app/providers/router/ui/admin-layout.tsx";

//App pages
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { ClientsPage } from "@/pages/clients-page";
import { CompanyDetailsPage } from "@/pages/company-details";
import { CampaignsPage } from "@/pages/campaigns";
import { InfluencersListPage } from "@/pages/influencers/influencer-list-page";
import { InfluencerDetailsPage } from "@/pages/influencers/influencer-details-page";
import { CreateInfluencerAccountPage } from "@/pages/influencers/create-influencer-account-page";
import { EditInfluencerAccountPage } from "@/pages/influencers/edit-influencer-account-page";
import { CampaignManagment } from "@/pages/campaign-managment";
import { CampaignManagmentAddAccounts } from "@/pages/campaign-managment-add-accounts";
import { InfluencerHistoryPage } from "@/pages/influencer-history/influencer-history-page";
import { InfluencerHistoryDetailsPage } from "@/pages/influencer-history/influencer-history-details-page";
import { InfluencerInvoicesPage } from "@/pages/influencer-invoices-page";
import { ClientsInvoicesPage } from "@/pages/clients-invoices-page";
import { PaymentHistoryPage } from "@/pages/payment-history-page";
import { InfluencersOffersPage } from "@/pages/influencers-offers-page";

export const ROUTER = createBrowserRouter([
  {
    path: "/",
    element: <Outlet/>,
    children: [
      { index: true, element: <RootRedirect/> },

      {
        element: <PublicOnly/>,
        children: [
          {
            element: <PublicLayout/>,
            children: [
              { path: "login", element: <LoginPage/> },
            ],
          },
        ],
      },

      {
        element: <ProtectedOnly/>,
        children: [
          {
            element: <AdminLayout/>,
            children: [
              { path: "dashboard", element: <DashboardPage/> },

              {
                path: "dashboard/clients",
                children: [
                  { index: true, element: <ClientsPage/> },
                  { path: ":clientId", element: <CompanyDetailsPage/> },
                ],
              },

              {
                path: "dashboard/campaigns",
                children: [
                  { index: true, element: <CampaignsPage/> },
                  {
                    path: "campaign-management",
                    children: [
                      { index: true, element: <CampaignManagment/> },
                      { path: "add-account", element: <CampaignManagmentAddAccounts/> },
                    ],
                  },
                ],
              },

              {
                path: "dashboard/create-new-campaign",
                children: [
                  {
                    index: true, element:
                      <div style={{
                        textAlign: "center",
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 20,
                        paddingBlock: 150,
                      }}>
                        <h1 style={{ fontSize: 40 }}>🚧 This page is under development</h1>
                        <p style={{ fontSize: 20, color: "#666" }}>
                          We're working hard to bring this feature to life.<br/>
                          It will be available very soon.
                        </p>
                      </div>,
                  },
                ],
              },

              {
                path: "dashboard/client-invoices",
                children: [
                  { index: true, element: <ClientsInvoicesPage/> },
                ],
              },

              {
                path: "dashboard/requests",
                children: [
                  {
                    index: true, element:
                      <div style={{
                        textAlign: "center",
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 20,
                        paddingBlock: 150,
                      }}>
                        <h1 style={{ fontSize: 40 }}>🚧 This page is under development</h1>
                        <p style={{ fontSize: 20, color: "#666" }}>
                          We're working hard to bring this feature to life.<br/>
                          It will be available very soon.
                        </p>
                      </div>,
                  },
                ],
              },

              {
                path: "dashboard/influencers",
                children: [
                  { index: true, element: <InfluencersListPage/> },
                  {
                    path: ":influencerId",
                    children: [
                      { index: true, element: <InfluencerDetailsPage/> },

                      {
                        path: "accounts",
                        children: [
                          { path: ":platform/create", element: <CreateInfluencerAccountPage/> },
                          { path: ":platform/:accountId/edit", element: <EditInfluencerAccountPage/> },
                        ],
                      },
                    ],
                  },
                ],
              },

              {
                path: "dashboard/payments-history",
                children: [
                  {
                    index: true, element: <PaymentHistoryPage />,
                  },
                ],
              },

              {
                path: "dashboard/influencer-invoices",
                children: [
                  {
                    index: true, element: <InfluencerInvoicesPage/>,
                  },
                ],
              },

              {
                path: "dashboard/influencer-history",
                children: [
                  { index: true, element: <InfluencerHistoryPage/> },
                  {
                    path: ":influencerId",
                    children: [
                      { index: true, element: <InfluencerHistoryDetailsPage/> },
                    ],
                  },
                ],
              },

              {
                path: "dashboard/offers",
                children: [
                  {
                    index: true, element: <InfluencersOffersPage/>,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
