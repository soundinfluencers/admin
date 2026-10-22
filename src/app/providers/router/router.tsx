import { createBrowserRouter } from "react-router-dom";
import { AppInitializationBoundary } from "./ui/app-initialization-boundary.tsx";
import { RootRedirect } from "./root-redirect.tsx";
import { ProtectedOnly, PublicOnly } from "./guards.tsx";
import { PublicLayout } from "@/app/providers/router/ui/public-layout.tsx";
import { AdminLayout } from "@/app/providers/router/ui/admin-layout.tsx";
import { CampaignDraftLifecycle } from "@/app/providers/router/campaign-draft-lifecycle.tsx";

//App pages
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { ClientsPage } from "@/pages/clients-page";
import { CompanyDetailsPage } from "@/pages/company-details";
import { CampaignsPage } from "@/pages/campaigns";
import { InfluencersListPage } from "@/pages/influencers/influencer-list-page";
import { InfluencerDetailsPage } from "@/pages/influencers/influencer-details-page";
import { SocialAccountCreatePage } from "@/pages/influencers/social-account-create-page";
import { SocialAccountEditPage } from "@/pages/influencers/social-account-edit-page";
import { CampaignManagementPage } from "@/pages/campaign-management-v2";
import { InfluencerHistoryPage } from "@/pages/influencer-history/influencer-history-page";
import { InfluencerHistoryDetailsPage } from "@/pages/influencer-history/influencer-history-details-page";
import { InfluencerInvoicesPage } from "@/pages/influencer-invoices-page";
import { ClientsInvoicesPage } from "@/pages/clients-invoices-page";
import { PaymentHistoryPage } from "@/pages/payment-history-page";
import { AdminCreateCampaignPage } from "@/pages/admin-create-campaign/ui/admin-create-campaign-page.tsx";
import { AdminCreateCampaignPostContentPage } from "@/pages/admin-create-campaign-post-content";
import {
  AdminCreateCampaignStrategyPage,
} from "@/pages/admin-create-campaign-strategy/ui/admin-create-campaign-strategy-page.tsx";
import { InfluencersOffersPage } from "@/pages/influencers-offers-page";
import { RequestsPage } from "@/pages/requests-page";

export const ROUTER = createBrowserRouter([
  {
    path: "/",
    element: (
      <CampaignDraftLifecycle>
        <AppInitializationBoundary />
      </CampaignDraftLifecycle>
    ),
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
                    path: "campaign-management/:status/:campaignId",
                    element: <CampaignManagementPage/>,
                  },

                  // {
                  //   path: "campaign-management",
                  //   children: [
                  //     { index: true, element: <CampaignManagment/> },
                  //     {
                  //       path: "add-account",
                  //       element: <AdminCreateCampaignPage/>,
                  //     },
                  //   ],
                  // },
                ],
              },

              {
                path: "dashboard/create-new-campaign",
                children: [
                  { index: true, element: <AdminCreateCampaignPage/> },
                  {
                    path: "content",
                    children: [
                      { index: true, element: <AdminCreateCampaignPostContentPage/> },
                      { path: "cmpaign-strategy", element: <AdminCreateCampaignStrategyPage/> },
                    ],
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
                    index: true, element: <RequestsPage/>,
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
                          { path: ":platform/create", element: <SocialAccountCreatePage/> },
                          { path: ":platform/:accountId/edit", element: <SocialAccountEditPage/> },
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
                    index: true, element: <PaymentHistoryPage/>,
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
