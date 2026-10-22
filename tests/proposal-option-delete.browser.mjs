import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CampaignManagementPage } from '/src/pages/campaign-management-v2/ui/campaign-management-page.tsx';
import { useCampaignManagementStore as store } from '/src/pages/campaign-management-v2/store/campaign-management.store.ts';
import { $api } from '/src/app/api/http.ts';

const search = new URLSearchParams(location.search);
const index = Number(search.get('index') ?? 0);
history.replaceState(null, '', `/dashboard/campaigns/campaign-management/proposal/synthetic?tab=strategy&keep=yes&proposal-option=${index}`);
store.getState().resetDraft();
const initial = {
  campaignId: 'synthetic', campaignName: 'Original synthetic campaign', status: 'proposal',
  socialMedia: 'instagram', creationDate: '2026-10-27T00:00:00Z', price: 100,
  displayCurrency: 'EUR', pricesByCurrency: { EUR: 100, USD: 110, GBP: 90 },
  existingOptions: search.has('single') ? [0] : [0, 1, 2], addedAccounts: [], addedBundles: [], campaignContent: [],
  shareLink: null, totalFollowers: 0, internalCost: 0,
};
const requests = [];
// No request can leave this fixture: all HTTP, including DELETE, is substituted.
$api.defaults.adapter = config => new Promise((resolve, reject) => {
  const request = { method: config.method, url: config.url, params: config.params,
    resolve: campaign => resolve({ data: { data: campaign }, status: 200, statusText: 'OK', headers: {}, config }),
    reject: () => reject(new Error('Simulated HTTP failure')) };
  requests.push(request);
  if (config.method === 'get' && requests.length === 1) request.resolve(initial);
});
const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
const router = createBrowserRouter([
  { path: '/dashboard/campaigns/campaign-management/:status/:campaignId', element: React.createElement(CampaignManagementPage) },
  { path: '/dashboard/campaigns', element: React.createElement('div', null, 'Campaigns test list') },
]);
window.proposalDeleteTest = { client, store, requests, router, initial };
createRoot(document.getElementById('test-root')).render(
  React.createElement(React.StrictMode, null,
    React.createElement(QueryClientProvider, { client },
      React.createElement(NuqsAdapter, null, React.createElement(RouterProvider, { router })))),
);
