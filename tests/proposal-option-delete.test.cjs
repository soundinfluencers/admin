const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { QueryClient, QueryObserver } = require('@tanstack/react-query');
const root = path.resolve(__dirname, '..');
const model = 'src/pages/campaign-management-v2/';
const widgets = 'src/widgets/campaign-management-v2/';

// Same node:test + TypeScript/VM approach as campaign-management-v2-placement.test.cjs.
function load(file, dependencies = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  const scope = { exports, structuredClone, URLSearchParams, ...globals, require(id) {
    if (Object.hasOwn(dependencies, id)) return dependencies[id];
    throw Error(`Unexpected dependency: ${id}`);
  } };
  vm.runInThisContext(`(function(scope) { const { ${Object.keys(scope).join(', ')} } = scope;\n${code}\n})`,
    { filename: file })(scope);
  return exports;
}

function lifecycle() {
  let slots = [], cursor = 0, dirty = false;
  const layouts = [], effects = [];
  const changed = (a, b) => !a || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));
  const effect = queue => (callback, deps) => {
    const index = cursor++, before = slots[index];
    if (changed(before?.deps, deps)) {
      slots[index] = { deps, cleanup: before?.cleanup };
      queue.push(() => { slots[index].cleanup?.(); slots[index].cleanup = callback(); });
    }
  };
  const react = {
    useRef(value) { return slots[cursor++] ??= { current: value }; },
    useState(value) {
      const slot = slots[cursor++] ??= { value: typeof value === 'function' ? value() : value };
      return [slot.value, next => {
        const value = typeof next === 'function' ? next(slot.value) : next;
        dirty ||= !Object.is(slot.value, value); slot.value = value;
      }];
    },
    useMemo(fn, deps) {
      const index = cursor++;
      if (changed(slots[index]?.deps, deps)) slots[index] = { deps, value: fn() };
      return slots[index].value;
    },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useLayoutEffect: effect(layouts), useEffect: effect(effects),
  };
  return { react, render(fn) {
    for (let i = 0; i < 30; i++) {
      dirty = false; cursor = 0; const result = fn();
      layouts.splice(0).forEach(run => run()); effects.splice(0).forEach(run => run());
      if (!dirty) return result;
    }
    throw Error('Render loop');
  }, unmount() { slots.forEach(slot => slot.cleanup?.()); slots = []; } };
}

const comparison = () => load(model + 'store/campaign-management.comparison.ts', {
  'fast-deep-equal': { default: require('fast-deep-equal') },
});
function createStore() {
  const persist = load(model + 'store/campaign-management.persist.ts');
  return load(model + 'store/campaign-management.store.ts', {
    zustand: require('zustand'), 'zustand/middleware': require('zustand/middleware'), bson: require('bson'),
    './campaign-management.persist.ts': persist, './campaign-management.comparison': comparison(),
    '@/entities/campaign/model/campaign-price.ts': load('src/entities/campaign/model/campaign-price.ts'),
    '@/entities/campaign/model/apply-promo-paid-to-campaign.ts': load('src/entities/campaign/model/apply-promo-paid-to-campaign.ts'),
    '@/entities/campaign/model/apply-whatsapp-updates-to-campaign.ts': load('src/entities/campaign/model/apply-whatsapp-updates-to-campaign.ts'),
  }, { localStorage: { getItem: () => null, setItem() {}, removeItem() {} } }).useCampaignManagementStore;
}

async function harness(t, { index = 0, options = [0, 1, 2], status = 'proposal' } = {}) {
  const life = lifecycle(), store = createStore();
  const storeHook = Object.assign(selector => selector(store.getState()), { getState: store.getState });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const { campaignsQueryKeys: keys } = load('src/entities/campaign/api/campaign.query-keys.ts');
  const h = { client, store, keys, gets: [], deletes: [], navigations: [], otherActions: [], errors: [], notifications: [],
    params: { campaignId: 'synthetic', status, ...(status === 'proposal' ? { optionIndex: index } : {}) },
    mounted: true, delayRoute: false, navigationError: false };
  const campaign = { campaignId: 'synthetic', status, campaignName: 'Original', existingOptions: options,
    price: 100, displayCurrency: 'EUR', pricesByCurrency: { EUR: 100, USD: 110, GBP: 90 },
    addedAccounts: [], campaignContent: [] };
  store.getState().initializeDraft({ params: h.params, campaign });
  const defer = (list, args) => new Promise((resolve, reject) => list.push({ args, resolve, reject }));
  const api = { getCampaignById: (...args) => defer(h.gets, args), deleteProposalOption: args => defer(h.deletes, args) };

  // Execute the production query hook against a real observer. Mirror useBaseQuery's
  // optimistic result, subscription and setOptions lifecycle; fetch/dedup/staleness are real.
  function useQuery(options) {
    const defaulted = client.defaultQueryOptions(options);
    defaulted._optimisticResults = 'optimistic';
    const [observer] = life.react.useState(() => new QueryObserver(client, defaulted));
    const result = observer.getOptimisticResult(defaulted);
    life.react.useLayoutEffect(() => {
      const unsubscribe = observer.subscribe(() => {});
      observer.updateResult(); return unsubscribe;
    }, [observer]);
    life.react.useEffect(() => { observer.setOptions(defaulted); }, [defaulted, observer]);
    return result;
  }
  const query = { useQueryClient: () => client, useQuery, skipToken: require('@tanstack/react-query').skipToken };
  const storeDependency = { useCampaignManagementStore: storeHook };
  const deps = {
    react: life.react, '@tanstack/react-query': query,
    'react-router-dom': {
      useParams: () => h.params,
      useLocation: () => ({ search: '?tab=strategy&keep=yes&proposal-option=' + (h.params.optionIndex ?? 0) }),
      useNavigate: () => async (href, options) => {
        h.navigations.push({ href, options });
        if (h.navigationError) throw Error('Navigation failed');
        if (href !== '/dashboard/campaigns' && !h.delayRoute) h.params = { ...h.params, optionIndex: 0 };
      },
    },
    nuqs: { parseAsInteger: { withDefault: v => v }, parseAsStringLiteral: () => ({ withDefault: v => v }),
      useQueryState: (key, value) => [key === 'proposal-option' ? h.params.optionIndex ?? 0 : value,
        value => h.otherActions.push(['switch', value])],
    },
    '@/entities/campaign/api/campaign.api.ts': api,
    '@/entities/campaign/api/campaign.query-keys.ts': { campaignsQueryKeys: keys },
    '../store/campaign-management.store.ts': storeDependency,
    '../store/campaign-management.comparison': comparison(),
    'react-toastify': { toast: { success: value => h.notifications.push(value) } },
    '@/app/api/errors/notify.ts': { notifyUnhandledApiError: error => h.errors.push(error) },
  };
  const queries = load('src/entities/campaign/api/use-campaigns-query.ts', deps);
  deps['@/entities/campaign/api/use-campaigns-query.ts'] = queries;
  const idle = () => ({ isMenuActionBlocked: () => false, isApproveFlowBlocked: () => false,
    isInsightsActionBlocked: () => false, isXlsxActionBlocked: () => false });
  const { useCampaignManagementState } = load(model + 'model/use-campaign-management-state.ts', {
    ...deps,
    './use-delete-proposal-option-actions.ts': load(model + 'model/use-delete-proposal-option-actions.ts', deps),
    './use-campaign-draft.ts': load(model + 'model/use-campaign-draft.ts', deps),
    './use-proposal-option-actions.ts': { useProposalOptionActions: () => ({
      openCreateOptionModal: () => h.otherActions.push('create'),
      changeProposalOption: () => h.otherActions.push('switch'),
    }) },
    './use-approve-proposal-option-actions': { useApproveProposalOptionActions: idle },
    './use-campaign-menu-actions': { useCampaignMenuActions: idle },
    './use-update-campaign-insights-actions': { useUpdateCampaignInsightsActions: idle },
    './use-append-campaign-xlsx-actions': { useAppendCampaignXlsxActions: idle },
    '@/features/campaign-management/save-campaign': { useUpdateCampaignMutation: () => ({
      mutate: () => h.otherActions.push('save'), mutateAsync: async () => {}, isPending: false,
    }) },
    '../store/campaign-management.selectors.ts': { selectCurrentFollowers: () => 0 },
    './url-path-helpers.ts': { isCampaignStatus: value => Boolean(value) },
    '@/shared/constants/campaign-view.ts': { CAMPAIGN_VIEW: { strategy: 'strategy', insights: 'insights' }, CAMPAIGN_VIEWS: ['strategy', 'insights'] },
    '@/entities/campaign/model/apply-promo-paid-to-campaign.ts': {},
    '@/entities/campaign/model/apply-whatsapp-updates-to-campaign': {}, '@/entities/campaign': api,
  });
  h.render = () => { if (h.mounted) h.hook = life.render(() => useCampaignManagementState({ onCampaignStatusChanged() {} })); };
  h.settle = async () => { for (let i = 0; i < 6; i++) { await new Promise(resolve => setImmediate(resolve)); h.render(); } };
  h.unmount = () => { h.mounted = false; life.unmount(); };
  t.after(() => { if (h.mounted) h.unmount(); client.clear(); });
  h.render(); assert.equal(h.gets.length, 1, 'ordinary mount still refetches');
  h.gets[0].resolve(campaign); await h.settle(); h.gets.length = 0;
  options.forEach(optionIndex => client.setQueryData(keys.detail({ ...h.params, optionIndex }), campaign));
  client.setQueryData(keys.list({ page: 1 }), []);
  store.getState().updateCampaignName('Unsaved'); h.render();
  h.start = async () => {
    h.hook.openDeleteOptionModal(); h.render();
    const promise = h.hook.confirmDeleteOption(); h.render(); await h.settle(); return { promise };
  };
  h.snapshot = () => ({ ...campaign, campaignName: 'Fresh remaining option', existingOptions: [0, 1] });
  return h;
}

for (const index of [0, 2]) test(`deleting ${index}: exactly one observer GET of 0, cache/draft/baseline/URL agree`, async t => {
  const h = await harness(t, { index }), before = h.store.getState().draft;
  const { promise } = await h.start();
  assert.deepEqual(h.deletes[0].args, { campaignId: 'synthetic', optionIndex: index });
  h.deletes[0].resolve(); await promise; await h.settle();
  assert.equal(h.gets.length, 1); assert.equal(h.gets[0].args[0].optionIndex, 0);
  assert.deepEqual(h.gets[0].args[1], { silentError: true });
  assert.equal(h.store.getState().draft, null); assert.equal(h.store.getState().baseline, null);
  assert.equal(h.client.getQueryData(h.keys.detail({ ...h.params, optionIndex: 2 })), undefined);
  assert.equal(h.hook.isCampaignEditingLocked, true);
  const snapshot = h.snapshot(); h.gets[0].resolve(snapshot); await h.settle();
  assert.equal(h.gets.length, 1, 'return to normal enabled query must not fetch again');
  assert.notEqual(h.store.getState().draft, before);
  assert.deepEqual(h.store.getState().draft.campaign, snapshot); assert.deepEqual(h.store.getState().baseline.campaign, snapshot);
  assert.deepEqual(h.client.getQueryData(h.keys.detail(h.params)), snapshot);
  assert.equal(h.params.optionIndex, 0); assert.equal(h.hook.isDeleteFlowBusy, false);
  assert.equal(h.hook.editorRevision, 1);
  assert.deepEqual(h.navigations, [{ href: '/dashboard/campaigns/campaign-management/proposal/synthetic?tab=strategy&keep=yes&proposal-option=0', options: { replace: true } }]);
  assert.equal(h.client.getQueryState(h.keys.list({ page: 1 })).isInvalidated, true);
  h.hook.resetDraft(); assert.equal(h.store.getState().draft.campaign.campaignName, snapshot.campaignName);
});

test('query stays paused for old index while router is switching to 0', async t => {
  const h = await harness(t, { index: 2 }); h.delayRoute = true;
  const { promise } = await h.start(); h.deletes[0].resolve(); await promise; await h.settle();
  assert.equal(h.gets.length, 0); assert.equal(h.hook.isDeleteFlowBusy, true);
  h.params = { ...h.params, optionIndex: 0 }; await h.settle();
  assert.equal(h.gets.length, 1); assert.equal(h.gets[0].args[0].optionIndex, 0);
  h.gets[0].resolve(h.snapshot()); await h.settle(); assert.equal(h.gets.length, 1);
});

test('GET failure/404 leaves editor cleared; double Retry is one GET and never DELETE', async t => {
  const h = await harness(t); const { promise } = await h.start();
  h.deletes[0].resolve(); await promise; await h.settle();
  h.gets[0].reject(Object.assign(Error('404'), { status: 404 })); await h.settle();
  assert.equal(h.hook.needsDeletedOptionRefresh, true); assert.equal(h.hook.data, null);
  assert.equal(h.store.getState().baseline, null); assert.equal(h.hook.isCampaignEditingLocked, true);
  h.hook.retryDeletedOptionRefresh(); h.hook.retryDeletedOptionRefresh(); await h.settle();
  assert.equal(h.deletes.length, 1); assert.equal(h.gets.length, 2);
  h.gets[1].resolve(h.snapshot()); await h.settle();
  assert.equal(h.hook.isDeleteFlowBusy, false); assert.equal(h.gets.length, 2);
});

test('single option navigates to list without a detail GET', async t => {
  const h = await harness(t, { options: [0] }); const { promise } = await h.start();
  assert.equal(h.hook.willDeleteCampaign, true);
  h.deletes[0].resolve(); await promise; await h.settle();
  assert.equal(h.gets.length, 0); assert.equal(h.store.getState().draft, null);
  assert.deepEqual(h.notifications, ['Campaign deleted']);
  assert.deepEqual(h.navigations, [{ href: '/dashboard/campaigns', options: { replace: true } }]);
});

for (const options of [[0], [0, 1]]) test(`navigation failure keeps recovery blocked, ${options.length} options`, async t => {
  const h = await harness(t, { options }); h.navigationError = true;
  const { promise } = await h.start(); h.deletes[0].resolve(); await promise; await h.settle();
  assert.equal(h.hook.deletedOptionNavigationHref, h.navigations[0].href);
  assert.equal(h.hook.isDeleteFlowBusy, true); assert.equal(h.hook.data, null);
  assert.equal(h.gets.length, 0);
  h.hook.retryDeletedOptionRefresh(); await h.hook.confirmDeleteOption();
  assert.equal(h.deletes.length, 1); assert.equal(h.gets.length, 0);
});

for (const invalid of [{ campaignId: 'wrong' }, { status: 'completed' }, { existingOptions: [1] }]) {
  test(`invalid recovery snapshot is rejected before caching/hydration: ${JSON.stringify(invalid)}`, async t => {
    const h = await harness(t); const { promise } = await h.start();
    h.deletes[0].resolve(); await promise; await h.settle();
    h.gets[0].resolve({ ...h.snapshot(), ...invalid }); await h.settle();
    assert.equal(h.hook.needsDeletedOptionRefresh, true); assert.equal(h.hook.data, null);
    assert.equal(h.store.getState().baseline, null);
    assert.equal(h.client.getQueryData(h.keys.detail(h.params)), undefined);
  });
}

test('another deletion after recovery still uses only one new GET', async t => {
  const h = await harness(t);
  const first = await h.start(); h.deletes[0].resolve(); await first.promise; await h.settle();
  h.gets[0].resolve(h.snapshot()); await h.settle();
  const second = await h.start(); h.deletes[1].resolve(); await second.promise; await h.settle();
  assert.equal(h.gets.length, 2); assert.equal(h.hook.data, null);
  h.gets[1].resolve({ ...h.snapshot(), campaignName: 'Second snapshot' }); await h.settle();
  assert.equal(h.gets.length, 2); assert.equal(h.hook.data.campaignName, 'Second snapshot');
});

for (const exit of ['unmount', 'campaign', 'option']) test(`late recovery GET cannot hydrate after ${exit}`, async t => {
  const h = await harness(t); const { promise } = await h.start();
  h.deletes[0].resolve(); await promise; await h.settle();
  let expected = null;
  if (exit === 'unmount') h.unmount();
  else {
    h.params = { ...h.params, ...(exit === 'campaign' ? { campaignId: 'other' } : { optionIndex: 1 }) };
    h.store.getState().initializeDraft({ params: h.params, campaign: { ...h.snapshot(), campaignId: h.params.campaignId, campaignName: 'Other context' } });
    expected = h.store.getState().draft; await h.settle();
  }
  h.gets[0].resolve(h.snapshot()); await h.settle();
  assert.equal(h.store.getState().draft, expected); assert.equal(h.hook.editorRevision, 0);
});

test('DELETE failure and synchronous double confirmation preserve the unsaved draft', async t => {
  const h = await harness(t), before = h.store.getState().draft;
  const { promise } = await h.start(); await h.hook.confirmDeleteOption(); h.hook.closeDeleteOptionModal(); h.render();
  assert.equal(h.deletes.length, 1); assert.equal(h.hook.isDeleteOptionModalOpen, true);
  assert.equal(h.hook.isDeletingOption, true); assert.equal(h.store.getState().draft, before);
  h.deletes[0].reject(Error('DELETE failed')); await promise; await h.settle();
  assert.equal(h.store.getState().draft, before); assert.equal(h.errors.length, 1);
  assert.equal(h.hook.isDeletingOption, false); assert.equal(h.hook.isDeleteOptionModalOpen, true);
});

function ui(file, react, overrides = {}) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const deps = { react, 'react/jsx-runtime': require('react/jsx-runtime'), clsx: { default: require('clsx') } };
  for (const node of source.statements) {
    if (!ts.isImportDeclaration(node) || !node.importClause || node.importClause.isTypeOnly) continue;
    const id = node.moduleSpecifier.text;
    if (deps[id]) continue;
    const dep = {};
    if (node.importClause.name) dep.default = new Proxy({}, { get: (_, key) => String(key) });
    for (const b of node.importClause.namedBindings?.elements ?? []) {
      if (!b.isTypeOnly) dep[b.propertyName?.text ?? b.name.text] = b.propertyName?.text ?? b.name.text;
    }
    deps[id] = dep;
  }
  return load(file, { ...deps, ...overrides });
}
function elements(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap(node => elements(node, predicate));
  if (!tree?.props) return [];
  return [...(predicate(tree) ? [tree] : []), ...elements(tree.props.children, predicate)];
}
const child = (tree, type) => elements(tree, node => node.type === type)[0];

test('opening/Cancel keeps Reset, Save, Add mounted; temporary locks and normal editing survive', async t => {
  const h = await harness(t), before = h.store.getState().draft;
  const react = { useState: v => [v, () => {}], useRef: v => ({ current: v }), useEffect() {} };
  const { CampaignManagementPage } = ui(model + 'ui/campaign-management-page.tsx', react, {
    '@/pages/campaign-management-v2/model/use-campaign-management-state.ts': { useCampaignManagementState: () => h.hook },
  });
  const { CampaignHeader } = ui(widgets + 'campaign-header/ui/campaign-header.tsx', react, {
    '@/entities/campaign/model/campaign-details.types.ts': { CAMPAIGN_STATUS_LABELS: { proposal: 'Proposal' } },
    '@/shared/constants/currency-taxonomy.ts': { CURRENCY_LABELS: { EUR: 'EUR' } },
  });
  const { CampaignWorkspace } = ui(widgets + 'campaign-workspace/ui/campaign-workspace/campaign-workspace.tsx', react, {
    '@/shared/constants/music-taxonomy': { CREATOR_CONTENT_FOCUS_LABELS: {}, COMMUNITY_THEME_TOPIC_LABELS: {} },
  });
  const { CampaignAccountsList } = ui(widgets + 'campaign-workspace/ui/campaign-accounts-list/campaign-accounts-list.tsx', react);
  const controls = () => {
    const page = CampaignManagementPage(), header = CampaignHeader(child(page, 'CampaignHeader').props);
    const workspace = CampaignWorkspace(child(page, 'CampaignWorkspace').props);
    const list = CampaignAccountsList(child(workspace, 'CampaignAccountsList').props);
    return { page, buttons: [...elements(header, n => n.type === 'button'), ...elements(list, n => n.type === 'button')] };
  };
  const initial = controls();
  h.hook.openDeleteOptionModal(); h.render();
  assert.equal(h.hook.isReadOnly, false); assert.equal(h.hook.isCampaignEditingLocked, true);
  const open = controls();
  assert.deepEqual(open.buttons.map(n => n.props['aria-label']), initial.buttons.map(n => n.props['aria-label']));
  assert.equal(open.buttons.length, 3); assert.ok(open.buttons.every(n => n.props.disabled));
  assert.equal(child(open.page, 'ProposalOptionToolbar').props.disabled, true);
  const info = child(open.page, 'CampaignInfo'); assert.equal(info.props.isBudgetDisabled, true);
  const { CampaignInfo } = ui(widgets + 'campaign-info/campaign-info.tsx', react, {
    '../libs/format-campaign-date.ts': { formatCampaignDate: () => '' },
    '@/shared/libs/format/format-compact-number.ts': { formatCompactNumber: () => '0' },
  });
  assert.equal(child(CampaignInfo(info.props), 'BudgetControl').props.disabled, true);
  h.hook.saveCampaign(); h.hook.resetDraft(); h.hook.openCreateOptionModal(); h.hook.changeProposalOption(1);
  h.hook.updateCampaignName('Blocked'); h.hook.setPrice(999);
  assert.deepEqual(h.otherActions, []); assert.equal(h.store.getState().draft, before);
  h.hook.closeDeleteOptionModal(); h.render();
  assert.equal(h.hook.isReadOnly, false); assert.equal(h.hook.isCampaignEditingLocked, false);
  assert.equal(h.store.getState().draft, before);
  assert.deepEqual(controls().buttons.map(n => n.props['aria-label']), initial.buttons.map(n => n.props['aria-label']));
  h.hook.updateCampaignName('Allowed'); assert.equal(h.store.getState().draft.campaign.campaignName, 'Allowed');
});

test('actual completed context stays readOnly and cannot open deletion', async t => {
  const h = await harness(t, { status: 'completed' });
  assert.equal(h.hook.isReadOnly, true); h.hook.openDeleteOptionModal(); h.render();
  assert.equal(h.hook.isDeleteOptionModalOpen, false); assert.equal(h.deletes.length, 0);
});
