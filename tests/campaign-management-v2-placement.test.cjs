const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const jsx = require('react/jsx-runtime');

const root = path.resolve(__dirname, '..');
const storeFile = 'src/pages/campaign-management-v2/store/campaign-management.store.ts';
const workspaceRoot = 'src/widgets/campaign-management-v2/campaign-workspace/ui/';
const workspaceFile = workspaceRoot + 'campaign-workspace/campaign-workspace.tsx';
const editorFile = workspaceRoot + 'campaign-account-editor/campaign-account-editor.tsx';
const listFile = workspaceRoot + 'campaign-accounts-list/campaign-accounts-list.tsx';
const tableFile = workspaceRoot + 'campaign-accounts-table/ui/campaign-accounts-table.tsx';
const columnsFile = workspaceRoot + 'campaign-accounts-table/model/campaign-accounts-table.columns.tsx';
const fields = ['impressions', 'like', 'comments', 'saves', 'shares'];
const plain = value => JSON.parse(JSON.stringify(value));

// Follow the existing node:test + TypeScript/VM infrastructure. No API or browser storage.
function loadSource(file, dependencies, globals = {}) {
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
        fileName: file,
        compilerOptions: {
            module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
            jsx: ts.JsxEmit.ReactJSX,
        },
    }).outputText;
    const exports = {};
    const globalsForModule = {
        exports, structuredClone, console: { log() {}, error: console.error }, ...globals,
        require(id) {
            if (Object.hasOwn(dependencies, id)) return dependencies[id];
            throw new Error(`Unexpected dependency: ${id}`);
        },
    };
    // Keep snapshots and fast-deep-equal in the same realm, including Object.prototype.
    const execute = vm.runInThisContext(
        `(function(moduleGlobals) { "use strict"; const { ${Object.keys(globalsForModule).join(', ')} } = moduleGlobals;\n${code}\n})`,
        { filename: file },
    );
    execute(globalsForModule);
    return exports;
}

function loadComparison() {
    return loadSource('src/pages/campaign-management-v2/store/campaign-management.comparison.ts', {
        'fast-deep-equal': { default: require('fast-deep-equal') },
    });
}

function loadPaidHelper() {
    return loadSource('src/entities/campaign/model/apply-promo-paid-to-campaign.ts', {});
}

function loadManagementHook(dependencies) {
    // Load the extracted business logic itself, sharing the same lifecycle and feature mocks.
    return loadSource('src/pages/campaign-management-v2/model/use-campaign-management-state.ts', {
        '@/entities/campaign': {},
        '@/entities/campaign/model/apply-whatsapp-updates-to-campaign': loadWhatsAppHelper(),
        './use-campaign-menu-actions': { useCampaignMenuActions: ({ isSaving }) => ({
            isMenuBusy: isSaving, isMenuActionBlocked: () => isSaving,
        }) },
        './use-approve-proposal-option-actions': { useApproveProposalOptionActions: () => ({
            isApproveFlowBusy: false, isApproveFlowBlocked: () => false,
        }) },
        './use-update-campaign-insights-actions': { useUpdateCampaignInsightsActions: () => ({
            isInsightsLocked: false, isInsightsActionBlocked: () => false,
        }) },
        ...dependencies,
        './use-campaign-draft.ts': loadSource('src/pages/campaign-management-v2/model/use-campaign-draft.ts', dependencies),
        './use-proposal-option-actions.ts': loadSource('src/pages/campaign-management-v2/model/use-proposal-option-actions.ts', dependencies),
        '@/entities/campaign/model/apply-promo-paid-to-campaign.ts': loadPaidHelper(),
    });
}

function loadWhatsAppHelper() {
    return loadSource('src/entities/campaign/model/apply-whatsapp-updates-to-campaign.ts', {});
}

function createStore(memory = new Map()) {
    const localStorage = {
        getItem: key => memory.get(key) ?? null,
        setItem: (key, value) => memory.set(key, value),
        removeItem: key => memory.delete(key),
    };
    const persist = loadSource('src/pages/campaign-management-v2/store/campaign-management.persist.ts', {});
    const price = loadSource('src/entities/campaign/model/campaign-price.ts', {});
    return loadSource(storeFile, {
        zustand: require('zustand'), 'zustand/middleware': require('zustand/middleware'),
        bson: require('bson'), './campaign-management.persist.ts': persist,
        './campaign-management.comparison': loadComparison(),
        '@/entities/campaign/model/campaign-price.ts': price,
        '@/entities/campaign/model/apply-promo-paid-to-campaign.ts': loadPaidHelper(),
        '@/entities/campaign/model/apply-whatsapp-updates-to-campaign.ts': loadWhatsAppHelper(),
    }, { localStorage }).useCampaignManagementStore;
}

function fixture(status = 'distributing') {
    const campaignContent = ['content-a', 'content-b'].map(_id => ({
        _id, socialMedia: 'instagram', profileType: 'creator', socialMediaGroup: 'main',
        mainLink: `https://example.test/${_id}`, taggedUser: '', taggedLink: '', mediaCache: {},
        descriptions: [1, 2].map(i => ({ _id: `${_id}-d${i}`, description: `${_id} description ${i}` })),
        additionalBrief: [1, 2].map(i => ({ _id: `${_id}-b${i}`, additionalBrief: `${_id} brief ${i}` })),
    }));
    return {
        params: { campaignId: 'synthetic-campaign', status, ...(status === 'proposal' ? { optionIndex: 0 } : {}) },
        campaign: {
            campaignId: 'synthetic-campaign', campaignName: 'Synthetic campaign', status,
            price: 100, displayCurrency: 'EUR', campaignContent,
            addedAccounts: ['placement-a', 'placement-b'].map((addedAccountsId, i) => ({
                addedAccountsId, socialAccountId: 'same-social-account', username: 'same-username',
                socialMedia: 'instagram', profileType: 'creator', followers: 100,
                selectedContent: {
                    campaignContentItemId: campaignContent[i]._id,
                    descriptionId: campaignContent[i].descriptions[0]._id,
                    additionalBriefId: campaignContent[i].additionalBrief[0]._id,
                },
                dateRequest: 'ASAP', postLink: `https://example.test/post/${i}`,
                screenshot: `https://example.test/screenshot/${i}`, closePromo: 'wait', statusLabel: 'Accepted',
                impressions: 10 + i, like: 20 + i, comments: 30 + i, saves: 40 + i, shares: 50 + i,
                countries: [], genres: [],
            })),
        },
    };
}

function initialized(status = 'distributing') {
    const store = createStore();
    const input = fixture(status);
    store.getState().initializeDraft(input);
    return { store, input };
}

const placementActions = [
    ['setAccountSelectedContent', ['content-b']],
    ['createContentForAccount', [' https://example.test/new-content ']],
    ['setAccountSelectedDescription', ['content-a-d2']],
    ['setAccountSelectedBrief', ['content-a-b2']],
    ['createDescriptionForAccount', [' new description ']],
    ['createBriefForAccount', [' new brief ']],
    ['setAccountDateRequest', ['2026-11-01']],
    ['setAccountPostLink', [' https://example.test/new-post ']],
    ['setAccountScreenshot', [' https://example.test/new-screenshot ']],
    ...fields.map(field => ['setAccountMetricField', [field, 123]]),
    ['removeAccount', []],
];

for (const [action, args] of placementActions) {
    const label = action === 'setAccountMetricField' ? `${action}(${args[0]})` : action;
    test(`${label} changes only the addressed placement, preserving input and other references`, () => {
        for (const target of ['placement-a', 'placement-b']) {
            const { store, input } = initialized();
            // Give both placements their own valid selection arguments, still with different content.
            const targetArgs = [...args];
            if (target === 'placement-b') {
                if (action === 'setAccountSelectedDescription') targetArgs[0] = 'content-b-d2';
                if (action === 'setAccountSelectedBrief') targetArgs[0] = 'content-b-b2';
                if (action === 'setAccountSelectedContent') targetArgs[0] = 'content-a';
            }
            const before = store.getState();
            const snapshot = plain(input);
            const other = before.draft.campaign.addedAccounts.find(a => a.addedAccountsId !== target);
            before[action](target, ...targetArgs);
            const after = store.getState();
            assert.notEqual(after.draft, before.draft);
            assert.notEqual(after.meta, before.meta);
            assert.equal(after.draft.campaign.addedAccounts.find(a => a.addedAccountsId === other.addedAccountsId), other);
            assert.deepEqual(plain(input), snapshot);
            assert.equal(before.draft.campaign.addedAccounts.length, 2);
            if (action === 'removeAccount') assert.equal(after.draft.campaign.addedAccounts.length, 1);
            else {
                const updated = after.draft.campaign.addedAccounts.find(a => a.addedAccountsId === target);
                assert.notEqual(updated, before.draft.campaign.addedAccounts.find(a => a.addedAccountsId === target));
                const selected = updated.selectedContent;
                const content = after.draft.campaign.campaignContent.find(c => c._id === selected.campaignContentItemId);
                if (action === 'setAccountSelectedContent') {
                    assert.equal(selected.campaignContentItemId, targetArgs[0]);
                    assert.equal(selected.descriptionId, content.descriptions[0]._id);
                    assert.equal(selected.additionalBriefId, content.additionalBrief[0]._id);
                }
                if (action === 'createContentForAccount') {
                    assert.equal(content.mainLink, targetArgs[0].trim());
                    assert.equal(selected.descriptionId, '');
                    assert.equal(selected.additionalBriefId, '');
                    assert.equal(after.draft.campaign.campaignContent.length, 3);
                }
                if (action === 'setAccountSelectedDescription') assert.equal(selected.descriptionId, targetArgs[0]);
                if (action === 'setAccountSelectedBrief') assert.equal(selected.additionalBriefId, targetArgs[0]);
                if (action === 'createDescriptionForAccount') {
                    assert.equal(content.descriptions.find(d => d._id === selected.descriptionId).description, targetArgs[0].trim());
                }
                if (action === 'createBriefForAccount') {
                    assert.equal(content.additionalBrief.find(b => b._id === selected.additionalBriefId).additionalBrief, targetArgs[0].trim());
                }
                if (action === 'setAccountDateRequest') assert.equal(updated.dateRequest, targetArgs[0]);
                if (action === 'setAccountPostLink') assert.equal(updated.postLink, targetArgs[0].trim());
                if (action === 'setAccountScreenshot') assert.equal(updated.screenshot, targetArgs[0].trim());
                if (action === 'setAccountMetricField') assert.equal(updated[targetArgs[0]], targetArgs[1]);
            }
        }
    });
}

test('unknown placement IDs and the social account ID are no-ops for every placement action', () => {
    const { store } = initialized();
    for (const [action, args] of placementActions) {
        for (const id of ['missing-placement', 'same-social-account']) {
            const before = store.getState();
            before[action](id, ...args);
            assert.equal(store.getState(), before);
        }
    }
});

test('existing validation and no-op rules preserve draft and meta references', () => {
    const { store } = initialized();
    const calls = [
        ['setAccountSelectedContent', 'content-a'], ['setAccountSelectedContent', 'missing'],
        ['setAccountSelectedDescription', 'content-a-d1'], ['setAccountSelectedDescription', 'content-b-d1'],
        ['setAccountSelectedBrief', 'content-a-b1'], ['setAccountSelectedBrief', 'missing'],
        ['createContentForAccount', ' '], ['createDescriptionForAccount', ' '], ['createBriefForAccount', ' '],
        ['setAccountDateRequest', 'ASAP'],
        ['setAccountPostLink', ' https://example.test/post/0 '],
        ['setAccountScreenshot', ' https://example.test/screenshot/0 '],
        ['setAccountMetricField', 'impressions', 10],
        ...[-1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN].map(value => ['setAccountMetricField', 'like', value]),
    ];
    for (const [action, ...args] of calls) {
        const before = store.getState();
        before[action]('placement-a', ...args);
        assert.equal(store.getState(), before, `${action}(${args})`);
    }
    store.getState().setAccountPostLink('placement-a', ' ');
    assert.equal(store.getState().draft.campaign.addedAccounts[0].postLink, '');
    const cleared = store.getState();
    cleared.setAccountPostLink('placement-a', ' ');
    assert.equal(store.getState(), cleared);
    const mismatched = fixture();
    mismatched.campaign.campaignContent[1].socialMedia = 'tiktok';
    store.setState({ draft: mismatched });
    const before = store.getState();
    before.setAccountSelectedContent('placement-a', 'content-b');
    assert.equal(store.getState(), before);
    before.setAccountScreenshot('placement-a', ' ');
    assert.equal(store.getState().draft.campaign.addedAccounts[0].screenshot, '');
});

test('Completed, Under Review and Proposal keep their store restrictions', () => {
    for (const status of ['completed', 'under_review', 'proposal', 'distributing']) {
        for (const [action, args] of placementActions) {
            const { store } = initialized(status);
            const before = store.getState();
            before[action]('placement-a', ...args);
            const distributingOnly = ['setAccountPostLink', 'setAccountScreenshot', 'setAccountMetricField'].includes(action);
            if (status === 'completed' || (distributingOnly && status !== 'distributing')) {
                assert.equal(store.getState(), before, `${status}: ${action}`);
            } else assert.notEqual(store.getState().draft, before.draft, `${status}: ${action}`);
        }
    }
});

test('shared content edits and deletions retain shared semantics and fallback IDs', () => {
    const { store } = initialized();
    store.getState().setAccountSelectedContent('placement-b', 'content-a');
    const accounts = store.getState().draft.campaign.addedAccounts;
    store.getState().updateContentDescription('content-a', 'content-a-d1', ' shared description ');
    store.getState().updateContentBrief('content-a', 'content-a-b1', ' shared brief ');
    store.getState().updateContentTaggedUser('content-a', '@shared');
    store.getState().updateContentTaggedLink('content-a', ' https://example.test/shared ');
    const campaign = store.getState().draft.campaign;
    assert.equal(campaign.addedAccounts, accounts);
    for (const account of campaign.addedAccounts) {
        const content = campaign.campaignContent.find(c => c._id === account.selectedContent.campaignContentItemId);
        assert.equal(content.descriptions[0].description, 'shared description');
        assert.equal(content.additionalBrief[0].additionalBrief, 'shared brief');
        assert.equal(content.taggedUser, '@shared');
        assert.equal(content.taggedLink, 'https://example.test/shared');
    }
    store.getState().createDescriptionForAccount('placement-a', 'new shared option');
    store.getState().createBriefForAccount('placement-a', 'new shared brief option');
    assert.equal(store.getState().draft.campaign.addedAccounts[1], accounts[1]);
    assert.equal(store.getState().draft.campaign.campaignContent[0].descriptions.length, 3);
    assert.equal(store.getState().draft.campaign.campaignContent[0].additionalBrief.length, 3);
    store.getState().setAccountSelectedDescription('placement-a', 'content-a-d1');
    store.getState().setAccountSelectedBrief('placement-a', 'content-a-b1');
    store.getState().deleteContentDescription('content-a', 'content-a-d1');
    store.getState().deleteContentBrief('content-a', 'content-a-b1');
    for (const account of store.getState().draft.campaign.addedAccounts) {
        assert.equal(account.selectedContent.descriptionId, 'content-a-d2');
        assert.equal(account.selectedContent.additionalBriefId, 'content-a-b2');
    }
    store.getState().deleteCampaignContent('content-a');
    for (const account of store.getState().draft.campaign.addedAccounts) {
        assert.deepEqual(plain(account.selectedContent), {
            campaignContentItemId: '', descriptionId: '', additionalBriefId: '',
        });
    }
    assert.deepEqual(store.getState().draft.campaign.campaignContent.map(c => c._id), ['content-b']);
});

test('deleting the final shared description and brief keeps the empty-ID fallback', () => {
    const { store } = initialized();
    store.getState().setAccountSelectedContent('placement-b', 'content-a');
    for (const id of ['content-a-d1', 'content-a-d2']) store.getState().deleteContentDescription('content-a', id);
    for (const id of ['content-a-b1', 'content-a-b2']) store.getState().deleteContentBrief('content-a', id);
    for (const account of store.getState().draft.campaign.addedAccounts) {
        assert.equal(account.selectedContent.descriptionId, '');
        assert.equal(account.selectedContent.additionalBriefId, '');
    }
});

// Execute the real component functions and callbacks, with children represented by React elements.
// This checks wiring and reconciliation keys; it is not a browser lifecycle test.
function loadUI(file, react = {}, overrides = {}) {
    const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'),
        ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const dependencies = { 'react/jsx-runtime': jsx, react, clsx: { default: require('clsx') } };
    for (const node of source.statements) {
        if (!ts.isImportDeclaration(node) || !node.importClause || node.importClause.isTypeOnly) continue;
        const id = node.moduleSpecifier.text;
        if (Object.hasOwn(dependencies, id)) continue;
        const dep = {};
        if (node.importClause.name) dep.default = new Proxy({}, { get: (_, key) => String(key) });
        for (const binding of node.importClause.namedBindings?.elements ?? []) {
            if (binding.isTypeOnly) continue;
            const name = binding.propertyName?.text ?? binding.name.text;
            dep[name] = name === 'SOCIAL_MEDIA_ICONS' ? { instagram: 'InstagramIcon' } : name;
        }
        dependencies[id] = dep;
    }
    return loadSource(file, { ...dependencies, ...overrides });
}

function elements(tree, predicate) {
    if (Array.isArray(tree)) return tree.flatMap(node => elements(node, predicate));
    if (!tree || typeof tree !== 'object' || !tree.props) return [];
    return [...(predicate(tree) ? [tree] : []), ...elements(tree.props.children, predicate)];
}
const child = (tree, type) => elements(tree, node => node.type === type)[0];
const initialReact = { useState: value => [value, () => {}], useMemo: fn => fn() };

const whatsAppRoot = 'src/features/campaign-management/send-campaign-whatsapp/';
function loadWhatsAppMessage() {
    return loadSource(whatsAppRoot + 'model/campaign-whatsapp-message.ts', {
        '@/shared/constants/social-media-taxonomy.ts': loadSource('src/shared/constants/social-media-taxonomy.ts', {}),
        '@/shared/constants/currency-taxonomy.ts': loadSource('src/shared/constants/currency-taxonomy.ts', {}),
    });
}

for (const [label, values, expectedReward] of [
    ['initialPrice=100, price=80', { initialPrice: 100, price: 80 }, '100 €'],
    ['initialPrice=0, price=30', { initialPrice: 0, price: 30 }, '30 €'],
    ['initialPrice absent, price=0', { price: 0 }, '0 €'],
    ['both prices are zero', { initialPrice: 0, price: 0 }, '0 €'],
    ['both prices are absent', {}, ''],
    ['initialPrice=0, price absent', { initialPrice: 0 }, ''],
    ['initialPrice is infinite', { initialPrice: Infinity, price: 30 }, ''],
    ['fallback price is not finite', { price: NaN }, ''],
    ['currency is absent', { initialPrice: 100, currency: undefined }, ''],
]) {
    test(`WhatsApp Reward: ${label}`, () => {
        const message = loadWhatsAppMessage();
        const campaign = { addedAccounts: [{
            ...fixture().campaign.addedAccounts[0], influencerId: 'influencer-a', currency: 'EUR', ...values,
        }] };
        const data = message.buildCampaignWhatsAppMessageData(campaign, 'influencer-a');
        assert.equal(data.placements[0].reward, expectedReward);
        const placement = message.getCampaignWhatsAppMessageBlocks(data).find(block => block.type === 'placement');
        assert.deepEqual(placement.fields.filter(([label]) => label === 'Reward'),
            expectedReward ? [['Reward', expectedReward]] : []);
        const whatsapp = message.formatCampaignWhatsAppMessage(data);
        const email = message.formatCampaignEmailMessage(data);
        if (expectedReward) {
            assert.ok(whatsapp.includes(`*Reward:* ${expectedReward}`));
            assert.ok(email.text.includes(`Reward: ${expectedReward}`));
        } else {
            assert.equal(whatsapp.includes('*Reward:*'), false);
            assert.equal(email.text.includes('Reward:'), false);
            assert.equal(email.html.includes('<strong>Reward:</strong>'), false);
        }
    });
}

function createWhatsAppHarness(status = 'distributing', withInsights = false) {
    const lifecycle = createHookLifecycle(), store = createStore();
    const input = fixture(status);
    input.campaign.addedAccounts.forEach(account => Object.assign(account, {
        influencerId: 'influencer-a', firstName: 'Synthetic', initialPrice: 50, currency: 'EUR',
        whatsappStatus: 'not_sent', whatsappLastAttemptAt: null,
        selectedContentItem: { mainLink: 'https://example.test/content', description: 'First line\nSecond line' },
    }));
    input.campaign.addedAccounts.push({
        ...structuredClone(input.campaign.addedAccounts[0]),
        addedAccountsId: 'placement-c', socialAccountId: 'another-social-account', influencerId: 'influencer-b',
    });
    store.getState().initializeDraft(input);
    const { QueryClient } = require('@tanstack/react-query');
    const queryClient = new QueryClient();
    const h = { store, input, lifecycle, queryClient, context: input.params, posts: [], saves: [], gets: [], scrapes: [], notifications: [] };
    const defer = (calls, args) => new Promise((resolve, reject) => calls.push({ args, resolve, reject }));
    // Execute real Query mutations, including their pending lock and retry policy, without HTTP.
    const query = {
        useQueryClient: () => queryClient,
        useIsMutating: filters => queryClient.isMutating(filters),
        useMutationState: ({ filters, select }) => queryClient.getMutationCache().findAll(filters).map(select),
        useMutation: options => ({
            mutateAsync: variables => queryClient.getMutationCache().build(queryClient, options).execute(variables),
            mutate: variables => { void queryClient.getMutationCache().build(queryClient, options).execute(variables).catch(() => {}); },
            isPending: queryClient.isMutating({ mutationKey: options.mutationKey }) > 0,
        }),
    };
    const api = {
        sendCampaignWhatsAppOne: request => defer(h.posts, request),
        updateCampaignById: request => defer(h.saves, request),
        getCampaignById: params => defer(h.gets, params),
        updateCampaignInsights: (body, options) => defer(h.scrapes, { body, options }),
    };
    const toast = Object.assign(() => {}, Object.fromEntries(['error', 'warning', 'success'].map(type =>
        [type, message => h.notifications.push({ type, message })])));
    const notify = { notifyUnhandledApiError: error => h.notifications.push({ type: 'error', message: error.message }) };
    const message = loadWhatsAppMessage();
    const feature = {
        ...loadSource(whatsAppRoot + 'model/build-campaign-whatsapp-requests.ts', { './campaign-whatsapp-message': message }),
        ...loadSource(whatsAppRoot + 'model/use-send-campaign-whatsapp-mutation.ts', {
            axios: require('axios'), '@tanstack/react-query': query, '@/entities/campaign': api,
            '@/entities/campaign/model/campaign-whatsapp.types': loadSource('src/entities/campaign/model/campaign-whatsapp.types.ts', {}),
        }),
    };
    const storeHook = Object.assign(selector => selector(store.getState()), { getState: store.getState });
    const menu = loadSource('src/pages/campaign-management-v2/model/use-campaign-menu-actions.ts', {
        react: lifecycle.react,
        'react-router-dom': { useNavigate: () => async () => {}, useLocation: () => ({ search: '' }) },
        '@/features/campaign-management/campaign-menu-actions': {
            useDownloadCampaignPdfMutation: () => ({}), useChangeCampaignStatusMutation: () => ({}),
        },
        '@/features/campaign-management/send-campaign-whatsapp': feature,
        '@/features/campaign-management/send-campaign-email': { useSendCampaignEmailMutation: () => ({ isRunning: () => false }) },
        '../store/campaign-management.store': { useCampaignManagementStore: storeHook },
        '../store/campaign-management.comparison': loadComparison(),
        '@/app/api/errors/notify': notify, 'react-toastify': { toast },
    });
    const campaignsQueryKeys = loadSource('src/entities/campaign/api/campaign.query-keys.ts', {}).campaignsQueryKeys;
    const saveFeature = loadSource('src/features/campaign-management/save-campaign/model/use-update-campaign-mutation.ts', {
        '@tanstack/react-query': query, '@/entities/campaign': api,
        '@/entities/campaign/api/campaign.query-keys.ts': { campaignsQueryKeys },
        './map-campaign-to-update-body': loadSource('src/features/campaign-management/save-campaign/model/map-campaign-to-update-body.ts', {}),
        'react-toastify': { toast }, '@/app/api/errors/notify.ts': notify,
    });
    const insightsFeature = loadSource('src/features/campaign-management/update-campaign-insights/model/use-update-campaign-insights-mutation.ts', {
        '@tanstack/react-query': query, '@/entities/campaign': api, 'react-toastify': { toast },
    });
    const insightsActions = loadSource('src/pages/campaign-management-v2/model/use-update-campaign-insights-actions.ts', {
        react: lifecycle.react, '@tanstack/react-query': query,
        '@/features/campaign-management/update-campaign-insights': insightsFeature,
        '../store/campaign-management.store': { useCampaignManagementStore: storeHook },
        '../store/campaign-management.comparison': loadComparison(),
    });
    const { useCampaignManagementState } = loadManagementHook({
        react: lifecycle.react, 'react-router-dom': { useParams: () => h.context }, '@tanstack/react-query': query,
        nuqs: {
            parseAsInteger: { withDefault: value => value }, parseAsStringLiteral: () => ({ withDefault: value => value }),
            useQueryState: (_, value) => [value, async () => {}],
        },
        '@/entities/campaign': api,
        '@/entities/campaign/api/use-campaigns-query.ts': { useCampaignDetailsQuery: () => ({}) },
        '@/entities/campaign/api/campaign.query-keys.ts': { campaignsQueryKeys },
        '../store/campaign-management.store.ts': { useCampaignManagementStore: storeHook },
        '../store/campaign-management.selectors.ts': loadSource('src/pages/campaign-management-v2/store/campaign-management.selectors.ts', {}),
        '../store/campaign-management.comparison': loadComparison(),
        './url-path-helpers.ts': { isCampaignStatus: value => ['pending', 'distributing', 'completed'].includes(value) },
        '@/shared/constants/campaign-view.ts': loadSource('src/shared/constants/campaign-view.ts', {}),
        './use-campaign-menu-actions': menu,
        ...(withInsights ? { './use-update-campaign-insights-actions': insightsActions } : {}),
        '@/features/campaign-management/save-campaign': saveFeature,
        '@/features/campaign-management/create-proposal-option': { useCreateProposalOption: () => ({}) },
        '@/app/api/errors/notify.ts': notify, 'react-toastify': { toast },
    });
    h.cacheKey = campaignsQueryKeys.detail(input.params);
    queryClient.setQueryData(h.cacheKey, structuredClone(input.campaign));
    h.render = () => h.hook = lifecycle.render(() => useCampaignManagementState({ onCampaignStatusChanged() {} }));
    h.open = (id = 'influencer-a') => { h.hook.requestMessagePreview(id); h.render(); };
    h.finishSync = async () => {
        await flush();
        assert.ok(h.gets.length > 0);
        h.gets.at(-1).resolve(structuredClone(h.input.campaign));
        await flush(); h.render();
    };
    h.render();
    return h;
}

test('row preview groups duplicate placements by influencer; opening and copying never send', async t => {
    const h = createWhatsAppHarness();
    const { getCampaignAccountsTableColumns } = loadUI(columnsFile);
    const trigger = {};
    const columns = getCampaignAccountsTableColumns({
        canSendMessage: true, onOpenMessagePreview: (id, button) => { assert.equal(button, trigger); h.open(id); },
    });
    const actions = columns.find(column => column.id === 'actions').cell({ row: { original: h.input.campaign.addedAccounts[1] } });
    elements(actions, n => n.props['data-action'] === 'previewMessage')[0].props.onClick({ currentTarget: trigger });
    const preview = h.hook.messagePreview;
    assert.equal(preview.request.influencerId, 'influencer-a');
    assert.equal(preview.request.accountId, 'same-social-account');
    assert.deepEqual(preview.data.placements.map(p => p.addedAccountsId), ['placement-a', 'placement-b']);
    assert.equal((preview.request.message.match(/Hi Synthetic,/g) || []).length, 1);
    assert.equal((preview.request.message.match(/Let us know/g) || []).length, 1);
    const copied = [];
    const lifecycle = createHookLifecycle();
    t.after(() => lifecycle.unmount());
    const { CampaignMessagePreviewModal } = loadUI(whatsAppRoot + 'ui/campaign-message-preview-modal.tsx', {
        ...lifecycle.react, Fragment: require('react').Fragment,
    }, {
        clsx: { default: require('clsx') },
        '@/shared/hooks/use-copy-to-clipboard': { useCopyToClipboard: () => async text => { copied.push(text); return true; } },
        '../model/campaign-whatsapp-message': loadWhatsAppMessage(),
    });
    const props = {
        preview, isSending: false, isSendingEmail: false,
        onClose: () => assert.fail('Copy must not close the preview'),
        onSendWhatsApp: h.hook.sendMessagePreview, onSendEmail: () => assert.fail('Copy must not send Email'),
    };
    const modal = lifecycle.render(() => CampaignMessagePreviewModal(props));
    const buttons = elements(modal, n => n.type === 'button');
    assert.equal(buttons.length, 4);
    buttons[0].props.onClick(); await flush();
    assert.deepEqual(copied, [preview.request.message]);
    assert.equal(buttons[2].props.disabled, false); assert.equal(buttons[3].props.disabled, false);
    for (const channel of ['isSending', 'isSendingEmail']) {
        const busy = lifecycle.render(() => CampaignMessagePreviewModal({ ...props, [channel]: true }));
        const busyButtons = elements(busy, n => n.type === 'button');
        assert.equal(busyButtons[2].props.disabled, true); assert.equal(busyButtons[3].props.disabled, true);
    }
    assert.equal(h.posts.length, 0); assert.equal(h.saves.length, 0); assert.equal(h.gets.length, 0);
});

test('dirty preview: Cancel preserves draft; Discard prepares baseline without POST or Save', () => {
    const h = createWhatsAppHarness();
    h.store.getState().updateContentDescription('content-a', 'content-a-d1', 'Unsaved description');
    h.render(); const before = h.store.getState(); h.open();
    assert.equal(h.hook.isMessageConfirmationOpen, true); assert.equal(h.hook.messagePreview, null);
    h.hook.cancelMenuAction(); h.render(); assert.equal(h.store.getState(), before);
    h.open(); h.hook.discardAndContinueMenuAction(); h.render();
    assert.equal(h.hook.isDirty, false); assert.ok(h.hook.messagePreview);
    assert.ok(!h.hook.messagePreview.request.message.includes('Unsaved description'));
    assert.equal(h.posts.length, 0); assert.equal(h.saves.length, 0);
});

for (const successful of [true, false]) test(`dirty preview waits for Save ${successful ? 'success' : 'failure'} without sending`, async () => {
    const h = createWhatsAppHarness(); h.store.getState().updateCampaignName('Unsaved name'); h.render(); h.open();
    h.hook.saveAndContinueMenuAction(); await flush(); h.render();
    assert.equal(h.saves.length, 1); assert.equal(h.hook.messagePreview, null); assert.equal(h.posts.length, 0);
    if (successful) {
        const saved = structuredClone(h.store.getState().draft.campaign);
        saved.addedAccounts[0].selectedContentItem.description = 'Confirmed description';
        h.saves[0].resolve(saved);
    } else h.saves[0].reject(new Error('Synthetic Save error'));
    await flush(); h.render();
    assert.equal(h.posts.length, 0);
    assert.equal(h.hook.isDirty, !successful);
    if (successful) assert.ok(h.hook.messagePreview.request.message.includes('Confirmed description'));
    else {
        assert.equal(h.hook.messagePreview, null); assert.equal(h.hook.isMessageConfirmationOpen, true);
        assert.equal(h.store.getState().draft.campaign.campaignName, 'Unsaved name');
    }
});

test('single send uses the prepared message, locks duplicate clicks through GET, and preserves other results and draft edits', async () => {
    const h = createWhatsAppHarness();
    h.open('influencer-b'); h.hook.sendMessagePreview(); await flush();
    h.posts[0].resolve({ status: 'sent' }); await h.finishSync();
    assert.equal(h.hook.messagePreview, null); assert.equal(h.hook.whatsAppAttempts['influencer-b'], 'sent');
    h.open(); const message = h.hook.messagePreview.request.message;
    // A local change after preparation must not rebuild the frozen request or be lost during GET.
    h.store.getState().updateCampaignName('Local edit during sending');
    h.hook.sendMessagePreview(); h.hook.sendMessagePreview(); await flush(); h.render();
    assert.equal(h.posts.length, 2); assert.equal(h.posts[1].args.message, message);
    assert.equal(h.hook.isSendingWhatsApp, true);
    h.posts[1].resolve({ status: 'sent' }); await flush(); h.render();
    h.hook.sendMessagePreview(); h.hook.closeMessagePreview();
    assert.equal(h.posts.length, 2); assert.ok(h.hook.messagePreview);
    h.input.campaign.campaignName = 'Server value';
    h.input.campaign.addedAccounts[0].whatsappStatus = 'sent';
    await h.finishSync();
    assert.equal(h.hook.whatsAppAttempts['influencer-b'], 'sent');
    assert.equal(h.hook.whatsAppAttempts['influencer-a'], 'sent');
    assert.equal(h.store.getState().draft.campaign.campaignName, 'Local edit during sending');
    assert.equal(h.store.getState().baseline.campaign.campaignName, 'Synthetic campaign');
    assert.equal(h.store.getState().draft.campaign.addedAccounts[0].whatsappStatus, 'sent');
    assert.equal(h.queryClient.getQueryData(h.cacheKey).campaignName, 'Synthetic campaign');
    assert.equal(h.hook.isDirty, true);
});

test('Send All continues after failure and records mixed outcomes before the final GET', async () => {
    const h = createWhatsAppHarness(); h.hook.requestWhatsAppSend(); h.hook.requestWhatsAppSend(); await flush(); h.render();
    assert.equal(h.posts.length, 2); assert.equal(h.gets.length, 0);
    h.posts[0].reject({ isAxiosError: true, response: { status: 502 } }); await flush(); h.render();
    assert.equal(h.hook.whatsAppAttempts['influencer-a'], 'failed');
    assert.equal(h.hook.whatsAppAttempts['influencer-b'], 'sending'); assert.equal(h.gets.length, 0);
    h.posts[1].resolve({ status: 'sent' }); await h.finishSync();
    assert.equal(h.hook.whatsAppAttempts['influencer-b'], 'sent');
    assert.match(h.notifications.at(-1).message, /1 sent, 1 failed, 0 unknown/);
    assert.equal(h.posts.length, 2);
});

for (const [label, error, expected] of [
    ['missing phone', { isAxiosError: true, response: { status: 400, data: { message: 'Influencer has no phone number' } } }, 'failed'],
    ['502', { isAxiosError: true, response: { status: 502 } }, 'failed'],
    ['other 400', { isAxiosError: true, response: { status: 400, data: { message: 'Other error' } } }, 'unknown'],
    ['timeout', { isAxiosError: true, code: 'ECONNABORTED' }, 'unknown'],
    ['unexpected response', null, 'unknown'],
]) test(`single send classifies ${label} as ${expected} without retry`, async () => {
    const h = createWhatsAppHarness(); h.open(); h.hook.sendMessagePreview(); await flush();
    if (error) h.posts[0].reject(error); else h.posts[0].resolve({});
    await h.finishSync();
    assert.equal(h.hook.whatsAppAttempts['influencer-a'], expected);
    assert.ok(h.hook.messagePreview); assert.equal(h.posts.length, 1);
});

test('failed status GET leaves the confirmed send visible without resending', async () => {
    const h = createWhatsAppHarness(); h.open(); h.hook.sendMessagePreview(); await flush();
    h.posts[0].resolve({ status: 'sent' }); await flush();
    h.gets[0].reject(new Error('Synthetic GET error')); await flush(); h.render();
    assert.equal(h.hook.whatsAppAttempts['influencer-a'], 'sent'); assert.equal(h.posts.length, 1);
    assert.match(h.notifications.at(-1).message, /Could not refresh/);
});

test('navigation during sending prevents old progress, GET and modal results from changing the new campaign', async () => {
    const h = createWhatsAppHarness(); h.open(); h.hook.sendMessagePreview(); await flush();
    const next = structuredClone(h.input); next.params.campaignId = next.campaign.campaignId = 'next-campaign';
    h.context = next.params; h.store.getState().initializeDraft(next); h.render();
    const before = h.store.getState();
    h.posts[0].resolve({ status: 'sent' }); await h.finishSync();
    assert.equal(h.store.getState(), before); assert.deepEqual(h.hook.whatsAppAttempts, {});
    assert.equal(h.hook.messagePreview, null); assert.equal(h.notifications.length, 0);
    assert.equal(h.gets[0].args.campaignId, 'synthetic-campaign');
});

test('navigation during Save prevents old preview and sending; Completed blocks both entry points', async () => {
    const h = createWhatsAppHarness(); h.store.getState().updateCampaignName('Dirty'); h.render(); h.open();
    h.hook.saveAndContinueMenuAction(); await flush();
    h.context = { ...h.context, campaignId: 'another-campaign' }; h.render();
    h.saves[0].resolve(structuredClone(h.input.campaign)); await flush(); h.render();
    assert.equal(h.hook.messagePreview, null); assert.equal(h.posts.length, 0);
    const completed = createWhatsAppHarness('completed');
    completed.open(); completed.hook.requestWhatsAppSend(); completed.hook.sendMessagePreview(); await flush();
    assert.equal(completed.hook.canSendWhatsApp, false); assert.equal(completed.hook.messagePreview, null);
    assert.equal(completed.posts.length, 0); assert.equal(completed.gets.length, 0);
});

test('list and Workspace select duplicates independently, use distinct keys and retain removal fallback', () => {
    const { store } = initialized();
    let selected = null;
    const react = { useState: () => [selected, value => { selected = value; }] };
    const { CampaignWorkspace } = loadUI(workspaceFile, react);
    const { CampaignAccountsList } = loadUI(listFile, initialReact);
    const props = { view: 'strategy', readOnly: false, onAccountRemove: id => store.getState().removeAccount(id) };
    const render = () => CampaignWorkspace({ ...props, campaign: store.getState().draft.campaign });
    let tree = render();
    const keys = [];
    for (const id of ['placement-a', 'placement-b']) {
        const list = CampaignAccountsList(child(tree, 'CampaignAccountsList').props);
        assert.deepEqual(elements(list, n => n.type === 'li').map(n => n.key), ['placement-a', 'placement-b']);
        const item = elements(list, n => n.type === 'li').find(n => n.key === id);
        child(item, 'button').props.onClick();
        tree = render();
        assert.equal(child(tree, 'CampaignAccountEditor').props.account.addedAccountsId, id);
        keys.push(child(tree, 'CampaignAccountEditor').key);
        const updated = CampaignAccountsList(child(tree, 'CampaignAccountsList').props);
        assert.equal(elements(updated, n => n.type === 'button' && n.props['aria-pressed']).length, 1);
        assert.equal(child(elements(updated, n => n.type === 'li').find(n => n.key === id), 'button').props['aria-pressed'], true);
    }
    assert.notEqual(keys[0], keys[1]);
    const audience = CampaignWorkspace({ ...props, view: 'audience', campaign: store.getState().draft.campaign });
    assert.equal(child(audience, 'CampaignAccountAudience').key, 'placement-b');
    child(tree, 'CampaignAccountHeader').props.onRemove();
    tree = render();
    assert.equal(child(tree, 'CampaignAccountEditor').props.account.addedAccountsId, 'placement-a');
    child(tree, 'CampaignAccountHeader').props.onRemove();
    assert.equal(child(render(), 'CampaignAccountEditor'), undefined);
});

test('editor callbacks pass placement IDs while shared callbacks pass content entity IDs', () => {
    const { CampaignAccountEditor } = loadUI(editorFile);
    for (const account of fixture().campaign.addedAccounts) {
        const calls = [];
        const callbacks = Object.fromEntries([
            'onAccountContentChange', 'onCreateContentForAccount', 'onAccountDescriptionChange',
            'onAccountBriefChange', 'onCreateDescriptionForAccount', 'onCreateBriefForAccount',
            'onAccountDateRequestChange', 'onUpdateDescriptionForAccount', 'onUpdateBriefForAccount',
            'onDeleteContentDescription', 'onDeleteContentBrief', 'onUpdateContentTaggedUser',
            'onUpdateContentTaggedLink', 'onDeleteCampaignContent',
        ].map(name => [name, (...args) => calls.push({ name, args })]));
        const props = { account, campaignContent: fixture().campaign.campaignContent, ...callbacks };
        const exercise = tree => {
            const assignment = child(tree, 'CampaignPlacementAssignment').props;
            assignment.onContentSelect('content-b'); assignment.onContentCreate('new');
            assignment.onDateRequestChange('new-date'); assignment.onDelete('content-b');
            for (const text of elements(tree, n => n.type === 'CampaignTextEditor')) {
                text.props.onSelect('option'); text.props.onCreate('new');
                text.props.onUpdate('option', 'edit'); text.props.onDelete('option');
            }
            const story = child(tree, 'CampaignStorySupport').props;
            story.onStoryTagChange('@new'); story.onStoryLinkChange('new-link');
        };
        exercise(CampaignAccountEditor({ ...props, readOnly: false }));
        for (const { name, args } of calls) {
            assert.equal(args[0], name === 'onDeleteCampaignContent' ? 'content-b'
                : ['onUpdateDescriptionForAccount', 'onUpdateBriefForAccount', 'onDeleteContentDescription',
                    'onDeleteContentBrief', 'onUpdateContentTaggedUser', 'onUpdateContentTaggedLink'].includes(name)
                    ? account.selectedContent.campaignContentItemId : account.addedAccountsId, name);
        }
        calls.length = 0;
        exercise(CampaignAccountEditor({ ...props, readOnly: true }));
        assert.equal(calls.length, 0);
    }
});

test('table row/cell IDs stay unique and stable; column callbacks and Paid address the row placement', () => {
    const { getCampaignAccountsTableColumns } = loadUI(columnsFile);
    const { CampaignAccountsTable } = loadUI(tableFile, initialReact, {
        '../model/campaign-accounts-table.columns.tsx': { getCampaignAccountsTableColumns },
    });
    const calls = [];
    const params = {
        campaignId: 'synthetic-campaign', canRemoveAccount: true, canEditMetrics: true,
        canEditPostDetails: true, canMarkAsPaid: true,
        onUpdatePostLink: (...args) => calls.push(args), onUpdateScreenshot: (...args) => calls.push(args),
        onUpdateAccountMetricField: (...args) => calls.push(args), onAccountRemove: (...args) => calls.push(args),
    };
    const columns = getCampaignAccountsTableColumns(params);
    const accounts = fixture().campaign.addedAccounts;
    const tableProps = CampaignAccountsTable({ ...params, accounts }).props;
    const { createTable, getCoreRowModel } = require('@tanstack/react-table');
    const table = createTable({
        data: accounts, columns, getRowId: tableProps.getRowId, getCoreRowModel: getCoreRowModel(),
        state: { columnPinning: { left: [], right: [] } }, onStateChange() {}, renderFallbackValue: null,
    });
    assert.deepEqual(table.getRowModel().rows.map(row => row.id), ['placement-a', 'placement-b']);
    const ids = table.getRowModel().rows.flatMap(row => row.getAllCells().map(cell => cell.id));
    assert.equal(new Set(ids).size, ids.length);
    for (const account of accounts) {
        calls.length = 0;
        const cell = id => columns.find(c => (c.accessorKey ?? c.id) === id).cell({ row: { original: account } });
        child(cell('postLink'), 'EditPostLink').props.onApply('new-post');
        child(cell('screenshot'), 'EditScreenshot').props.onApply('new-screenshot');
        for (const field of fields) cell(field).props.onApply(123);
        child(cell('actions'), 'button').props.onClick();
        assert.equal(calls.length, 8);
        for (const args of calls) assert.equal(args[0], account.addedAccountsId);
        assert.equal(cell('paid').props.promoId, account.addedAccountsId);
    }
    table.setOptions(options => ({ ...options, data: [accounts[1]] }));
    assert.equal(table.getRowModel().rows[0].id, 'placement-b');
    const sum = id => columns.find(c => c.accessorKey === id).footer({ table: { options: { data: accounts } } });
    assert.equal(sum('followers'), 200);
    for (const field of fields) assert.equal(sum(field), accounts[0][field] + accounts[1][field]);
});

test('Paid store result updates only its promoId and preserves existing meta behavior', () => {
    const { store } = initialized();
    const before = store.getState();
    const result = { campaignId: 'synthetic-campaign', promoId: 'placement-b', closePromo: 'close', statusLabel: 'Paid' };
    before.applyPromoPaid(result);
    const after = store.getState();
    assert.equal(after.draft.campaign.addedAccounts[0], before.draft.campaign.addedAccounts[0]);
    assert.equal(after.draft.campaign.addedAccounts[1].closePromo, 'close');
    assert.equal(after.meta, before.meta);
    after.applyPromoPaid(result);
    assert.equal(store.getState(), after);
    after.applyPromoPaid({ ...result, campaignId: 'another-campaign', promoId: 'placement-a' });
    assert.equal(store.getState(), after);
});

function loadPageHook(store, status = 'distributing', queryClient = {}) {
    const { selectCurrentFollowers } = loadSource('src/pages/campaign-management-v2/store/campaign-management.selectors.ts', {});
    const { useCampaignManagementState } = loadManagementHook({
        react: {
            useMemo: fn => fn(), useCallback: fn => fn, useEffect() {},
            useState: value => [value, () => {}], useRef: value => ({ current: value }),
            useLayoutEffect: fn => fn(), createElement: require('react').createElement,
        },
        'react-router-dom': { useParams: () => ({ campaignId: 'synthetic-campaign', status }) },
        '@tanstack/react-query': { useQueryClient: () => queryClient },
        nuqs: {
            parseAsInteger: { withDefault: value => value },
            parseAsStringLiteral: () => ({ withDefault: value => value }),
            useQueryState: (_, value) => [value, () => {}],
        },
        '@/entities/campaign/api/use-campaigns-query.ts': { useCampaignDetailsQuery: () => ({}) },
        '@/entities/campaign/api/campaign.query-keys.ts': { campaignsQueryKeys: { details: () => ['details'] } },
        '../store/campaign-management.store.ts': {
            useCampaignManagementStore: Object.assign(selector => selector(store.getState()), { getState: store.getState }),
        },
        '../store/campaign-management.selectors.ts': { selectCurrentFollowers },
        '../store/campaign-management.comparison': loadComparison(),
        '@/features/campaign-management/save-campaign': { useUpdateCampaignMutation: () => ({}) },
        '@/features/campaign-management/create-proposal-option': { useCreateProposalOption: () => ({}) },
        '@/app/api/errors/notify.ts': { notifyUnhandledApiError() {} },
        'react-toastify': { toast: { error() {} } },
        './url-path-helpers.ts': { isCampaignStatus: value => ['distributing', 'completed', 'under_review', 'proposal'].includes(value) },
        '@/shared/constants/campaign-view.ts': {
            CAMPAIGN_VIEWS: ['strategy', 'audience', 'insights'], CAMPAIGN_VIEW: { strategy: 'strategy', insights: 'insights' },
        },
    });
    return useCampaignManagementState({ onCampaignStatusChanged() {} });
}

test('hook → page → Workspace → editor/table forwards placement ID into the store', () => {
    const { store } = initialized();
    const state = loadPageHook(store);
    const { CampaignManagementPage } = loadUI('src/pages/campaign-management-v2/ui/campaign-management-page.tsx', {
        useState: value => [value, () => {}], useRef: value => ({ current: value }),
    }, {
        '@/pages/campaign-management-v2/model/use-campaign-management-state.ts': { useCampaignManagementState: () => state },
    });
    const pageProps = child(CampaignManagementPage(), 'CampaignWorkspace').props;
    const { CampaignWorkspace } = loadUI(workspaceFile, { useState: () => ['placement-b', () => {}] });
    const workspace = CampaignWorkspace(pageProps);
    const { CampaignAccountEditor } = loadUI(editorFile);
    const editor = CampaignAccountEditor(child(workspace, 'CampaignAccountEditor').props);
    const first = store.getState().draft.campaign.addedAccounts[0];
    child(editor, 'CampaignPlacementAssignment').props.onDateRequestChange('2026-12-01');
    assert.equal(store.getState().draft.campaign.addedAccounts[1].dateRequest, '2026-12-01');
    const insights = CampaignWorkspace({ ...pageProps, view: 'insights' });
    const tableProps = child(insights, 'CampaignAccountsTable').props;
    const { getCampaignAccountsTableColumns } = loadUI(columnsFile);
    const columns = getCampaignAccountsTableColumns(tableProps);
    const post = columns.find(c => c.accessorKey === 'postLink').cell({ row: { original: pageProps.campaign.addedAccounts[1] } });
    child(post, 'EditPostLink').props.onApply('https://example.test/through-page');
    assert.equal(store.getState().draft.campaign.addedAccounts[1].postLink, 'https://example.test/through-page');
    assert.equal(store.getState().draft.campaign.addedAccounts[0], first);
    for (const status of ['completed', 'under_review', 'proposal', 'distributing']) {
        const h = loadPageHook(initialized(status).store, status);
        assert.equal(h.isReadOnly, status === 'completed');
        assert.equal(h.canEditMetrics, status === 'distributing');
        assert.equal(h.canEditPostDetails, status === 'distributing');
        assert.equal(h.canMarkAsPaid, status === 'distributing');
    }
});

test('Paid hook updates only the selected promo in the query cache and draft', async () => {
    const { store } = initialized();
    let cache = fixture().campaign;
    const first = cache.addedAccounts[0];
    let cancelled = false;
    const queryClient = {
        async cancelQueries() { cancelled = true; },
        setQueriesData(filters, update) {
            assert.equal(cancelled, true);
            assert.equal(filters.queryKey[1].campaignId, 'synthetic-campaign');
            assert.equal(update(undefined), undefined);
            cache = update(cache);
        },
    };
    const hook = loadPageHook(store, 'distributing', queryClient);
    await hook.onPromoPaid({ campaignId: 'synthetic-campaign', promoId: 'placement-b', closePromo: 'close', statusLabel: 'Paid' });
    assert.equal(cache.addedAccounts[0], first);
    assert.equal(cache.addedAccounts[1].closePromo, 'close');
    assert.equal(store.getState().draft.campaign.addedAccounts[0].closePromo, 'wait');
    assert.equal(store.getState().draft.campaign.addedAccounts[1].closePromo, 'close');
});

test('legacy budget and currency handling and follower aggregation remain intact', () => {
    const { store } = initialized();
    store.getState().setCampaignPrice(200);
    assert.equal(store.getState().draft.campaign.pricesByCurrency, undefined);
    const before = store.getState();
    before.setDisplayCurrency('USD');
    assert.equal(store.getState(), before);
    store.setState({ draft: { ...before.draft, campaign: {
        ...before.draft.campaign, pricesByCurrency: { EUR: 200, USD: 250 },
    } } });
    store.getState().setDisplayCurrency('USD');
    assert.equal(store.getState().draft.campaign.price, 250);
    store.getState().setCampaignPrice(300);
    assert.equal(store.getState().draft.campaign.pricesByCurrency.USD, 300);
    const { selectCurrentFollowers } = loadSource('src/pages/campaign-management-v2/store/campaign-management.selectors.ts', {});
    assert.equal(selectCurrentFollowers(store.getState()), 200);
});

// The same source spinner with persistent hook slots and commit/cleanup phases.
// This simulates React lifecycle and HTTP; it does not run a browser.
function createHookLifecycle() {
    let slots = [], cursor = 0, changedState = false;
    const layouts = [], effects = [];
    const changed = (before, after) => !before || before.length !== after.length ||
        before.some((value, index) => !Object.is(value, after[index]));
    const effect = queue => (callback, deps) => {
        const index = cursor++, previous = slots[index];
        if (changed(previous?.deps, deps)) {
            slots[index] = { deps, callback, cleanup: previous?.cleanup };
            queue.push(() => {
                slots[index].cleanup?.();
                slots[index].cleanup = callback();
            });
        }
    };
    const react = {
        createElement: require('react').createElement,
        useRef(value) { return slots[cursor++] ??= { current: value }; },
        useState(value) {
            const slot = slots[cursor++] ??= { value: typeof value === 'function' ? value() : value };
            return [slot.value, next => {
                const value = typeof next === 'function' ? next(slot.value) : next;
                changedState ||= !Object.is(slot.value, value);
                slot.value = value;
            }];
        },
        useMemo(callback, deps) {
            const index = cursor++;
            if (changed(slots[index]?.deps, deps)) slots[index] = { deps, value: callback() };
            return slots[index].value;
        },
        useCallback(callback, deps) { return react.useMemo(() => callback, deps); },
        useLayoutEffect: effect(layouts), useEffect: effect(effects),
    };
    return {
        react,
        render(callback) {
            let result;
            for (let count = 0; count < 20; count++) {
                changedState = false; cursor = 0; result = callback();
                layouts.splice(0).forEach(run => run());
                effects.splice(0).forEach(run => run());
                if (!changedState) return result;
            }
            throw new Error('Unexpected render loop');
        },
        unmount() {
            slots.forEach(slot => slot.cleanup?.()); slots = []; layouts.length = 0; effects.length = 0;
        },
        replayEffects() {
            slots.filter(slot => slot.callback).forEach(slot => {
                slot.cleanup?.(); slot.cleanup = slot.callback();
            });
        },
    };
}

const flush = () => new Promise(resolve => setImmediate(resolve));
function createProposalHarness(store = initialized('proposal').store, withApproval = false) {
    const lifecycle = createHookLifecycle();
    const saves = [], copies = [], navigations = [], queries = [], notifications = [], invalidations = [];
    const defer = (calls, args) => new Promise((resolve, reject) => calls.push({ args, resolve, reject }));
    const h = {
        store, lifecycle, saves, copies, navigations, queries, notifications, invalidations,
        approvals: [], statusNavigations: [], cancellations: [],
        context: { campaignId: 'synthetic-campaign', status: 'proposal', optionIndex: 0, view: 'strategy' },
        query: {}, navigationError: null, optimisticNavigation: false, invalidationError: null,
    };
    const queryClient = {
        isMutating: () => 0,
        async cancelQueries(filters) { h.cancellations.push(filters); }, setQueryData() {},
        async invalidateQueries(filters) {
            invalidations.push(filters);
            if (h.invalidationError) throw h.invalidationError;
        },
    };
    const useMutation = options => {
        const state = lifecycle.react.useRef({ pending: false }).current;
        const mutateAsync = async variables => {
            state.pending = true;
            try {
                if (options.onMutate) await options.onMutate(variables);
                const result = await options.mutationFn(variables);
                await options.onSuccess?.(result, variables);
                return result;
            } catch (error) {
                await options.onError?.(error, variables);
                throw error;
            } finally {
                state.pending = false;
            }
        };
        return { mutateAsync, mutate: variables => { void mutateAsync(variables).catch(() => {}); }, isPending: state.pending };
    };
    const campaignsQueryKeys = loadSource('src/entities/campaign/api/campaign.query-keys.ts', {}).campaignsQueryKeys;
    const toast = Object.assign(() => {}, { error: (message, options) => notifications.push({ message, options }) });
    const errorNotifications = loadSource('src/app/api/errors/notify.ts', {
        'react-toastify': { toast },
        './normalize': loadSource('src/app/api/errors/normalize.ts', { axios: require('axios') }),
    });
    h.errorNotifications = errorNotifications;
    const saveFeature = loadSource('src/features/campaign-management/save-campaign/model/use-update-campaign-mutation.ts', {
        '@tanstack/react-query': { useMutation, useQueryClient: () => queryClient },
        '@/entities/campaign': { updateCampaignById: variables => defer(saves, variables) },
        '@/entities/campaign/api/campaign.query-keys.ts': { campaignsQueryKeys },
        './map-campaign-to-update-body': loadSource('src/features/campaign-management/save-campaign/model/map-campaign-to-update-body.ts', {}),
        'react-toastify': { toast },
        '@/app/api/errors/notify.ts': errorNotifications,
    });
    const createFeature = {
        ...loadSource('src/features/campaign-management/create-proposal-option/model/map-campaign-to-proposal-option-body.ts', {}),
        ...loadSource('src/features/campaign-management/create-proposal-option/model/use-create-proposal-option-mutation.ts', {
            '@tanstack/react-query': { useMutation },
            '@/entities/campaign': { createProposalOption: variables => defer(copies, variables) },
        }),
    };
    const approvalDependencies = {};
    if (withApproval) {
        const approvalApi = loadSource('src/entities/campaign/api/campaign.api.ts', {
            '@/app/api/http.ts': { $api: { post: (...args) => defer(h.approvals, args) } },
        });
        const approvalFeature = loadSource('src/features/campaign-management/approve-proposal-option/model/use-approve-proposal-option-mutation.ts', {
            '@tanstack/react-query': { useMutation, useQueryClient: () => queryClient },
            '@/entities/campaign/api/campaign.api': approvalApi,
            '@/entities/campaign/api/campaign.query-keys': { campaignsQueryKeys },
            '@/app/api/errors/notify': errorNotifications,
        });
        approvalDependencies['./use-approve-proposal-option-actions'] = loadSource('src/pages/campaign-management-v2/model/use-approve-proposal-option-actions.ts', {
            react: lifecycle.react,
            'react-router-dom': {
                useLocation: () => ({ search: `?proposal-option=${h.context.optionIndex}&tab=${h.context.view}` }),
                useNavigate: () => async (href, options) => { h.statusNavigations.push({ href, options }); },
            },
            '@/features/campaign-management/approve-proposal-option': approvalFeature,
            '../store/campaign-management.store': { useCampaignManagementStore: Object.assign(selector => selector(store.getState()), { getState: store.getState }) },
            '../store/campaign-management.comparison': loadComparison(),
        });
    }
    const { useCampaignManagementState } = loadManagementHook({
        react: lifecycle.react,
        'react-router-dom': { useParams: () => h.context },
        '@tanstack/react-query': { useQueryClient: () => queryClient },
        nuqs: {
            parseAsInteger: { withDefault: value => value },
            parseAsStringLiteral: () => ({ withDefault: value => value }),
            useQueryState(key) {
                if (key === 'tab') return [h.context.view, async value => { h.context.view = value; }];
                return [h.context.optionIndex, async value => {
                    navigations.push(value);
                    if (!h.navigationError || h.optimisticNavigation) {
                        h.context.optionIndex = value; h.query = {}; h.render();
                    }
                    if (h.navigationError) throw h.navigationError;
                    return new URLSearchParams({ 'proposal-option': String(value) });
                }];
            },
        },
        '@/entities/campaign/api/use-campaigns-query.ts': { useCampaignDetailsQuery: params => {
            if (JSON.stringify(queries.at(-1)) !== JSON.stringify(params)) queries.push(params);
            return h.query;
        } },
        '@/entities/campaign/api/campaign.query-keys.ts': { campaignsQueryKeys },
        '../store/campaign-management.store.ts': { useCampaignManagementStore: Object.assign(selector => selector(store.getState()), { getState: store.getState }) },
        '../store/campaign-management.selectors.ts': loadSource('src/pages/campaign-management-v2/store/campaign-management.selectors.ts', {}),
        '../store/campaign-management.comparison': loadComparison(),
        './url-path-helpers.ts': { isCampaignStatus: value => ['pending', 'distributing', 'completed', 'proposal'].includes(value) },
        '@/shared/constants/campaign-view.ts': loadSource('src/shared/constants/campaign-view.ts', {}),
        '@/features/campaign-management/save-campaign': saveFeature,
        '@/features/campaign-management/create-proposal-option': createFeature,
        ...approvalDependencies,
        'react-toastify': { toast },
        '@/app/api/errors/notify.ts': errorNotifications,
    });
    h.render = () => {
        h.hook = lifecycle.render(() => useCampaignManagementState({ onCampaignStatusChanged() {} }));
        return h.hook;
    };
    h.confirmCopy = () => {
        store.getState().updateCampaignName('Unsaved name'); h.render();
        h.hook.openCreateOptionModal(); h.render(); h.hook.createProposalCopy(); h.render();
        assert.equal(h.hook.isUnsavedChangesModalOpen, true);
    };
    h.render();
    return h;
}

function createApprovalHarness() {
    const store = createStore(), input = fixture('proposal');
    input.params.optionIndex = 4;
    store.getState().initializeDraft(input);
    const h = createProposalHarness(store, true);
    h.context.optionIndex = 4; h.render();
    h.prepareApproval = async () => {
        h.hook.updateCampaignName('Unsaved approval name'); h.render();
        h.hook.openApproveOptionModal(); h.render();
        await h.hook.confirmApproveOption(); h.render();
        assert.equal(h.hook.isApproveUnsavedChangesModalOpen, true);
        assert.equal(h.approvals.length, 0);
    };
    h.resolveApproval = async () => {
        h.approvals[0].resolve({ data: {
            statusCode: 200, message: 'Synthetic approval response', data: { campaignId: 'synthetic-campaign' },
        } });
        await flush(); h.render();
    };
    return h;
}

function assertVisibleSaveControls(state) {
    const lifecycle = createHookLifecycle();
    const { CampaignHeader } = loadUI('src/widgets/campaign-management-v2/campaign-header/ui/campaign-header.tsx', lifecycle.react, {
        '@/entities/campaign/model/campaign-details.types.ts': loadSource('src/entities/campaign/model/campaign-details.types.ts', {}),
        '@/shared/constants/currency-taxonomy.ts': loadSource('src/shared/constants/currency-taxonomy.ts', {}),
    });
    const tree = lifecycle.render(() => CampaignHeader({
        onSave: state.saveCampaign, isSaveDisabled: !state.canSave, isDirty: state.isDirty, isSaving: state.isSaving,
        campaignName: state.data.campaignName, onCampaignNameChange: state.updateCampaignName,
        campaignStatus: state.data.status, internalCost: 0, currency: state.data.displayCurrency,
        onReset: state.resetDraft, isResetDisabled: !state.canReset, readOnly: state.isReadOnly,
    }));
    assert.equal(state.isReadOnly, false);
    const save = elements(tree, node => node.type === 'button' && node.props['aria-label'] === 'Save campaign changes');
    const reset = elements(tree, node => node.type === 'button' && node.props['aria-label'] === 'Reset changes');
    assert.equal(save.length, 1); assert.equal(reset.length, 1);
    assert.equal(save[0].props.disabled, !state.canSave || state.isSaving);
    assert.equal(reset[0].props.disabled, !state.canReset);
    lifecycle.unmount();
}

test('Save controls reflect clean, dirty and pending states without becoming readOnly', async () => {
    const h = createProposalHarness(initialized('pending').store); h.context.status = 'pending'; h.render();
    assert.equal(h.hook.canSave, false); assertVisibleSaveControls(h.hook);
    h.hook.saveCampaign(); assert.equal(h.saves.length, 0);
    h.hook.updateCampaignName('Dirty save'); h.render();
    assert.equal(h.hook.canSave, true); assertVisibleSaveControls(h.hook);
    h.hook.saveCampaign(); h.render();
    assert.equal(h.saves.length, 1); assert.equal(h.hook.isSaving, true);
    assert.equal(h.hook.canSave, false); assertVisibleSaveControls(h.hook);
    h.hook.saveCampaign(); assert.equal(h.saves.length, 1);
    h.saves[0].resolve({ ...fixture('pending').campaign, campaignName: 'Dirty save' }); await flush(); h.render();
    assert.equal(h.hook.isDirty, false); assert.equal(h.hook.canSave, false); assertVisibleSaveControls(h.hook);
});

test('Directly approve: Save returns to confirmation; only explicit Approve sends nonzero optionIndex in query', async () => {
    const h = createApprovalHarness(); await h.prepareApproval();
    assert.equal(h.hook.canSave, false); assert.equal(h.hook.canReset, false); assertVisibleSaveControls(h.hook);
    const before = h.store.getState(); h.hook.saveCampaign(); h.hook.resetDraft();
    assert.equal(h.saves.length, 0); assert.equal(h.store.getState(), before);
    const saving = h.hook.saveBeforeApprove(); h.render();
    assert.equal(h.saves.length, 1); assert.equal(h.hook.isPreparingApproval, true); assertVisibleSaveControls(h.hook);
    h.saves[0].resolve({ ...fixture('proposal').campaign, campaignName: 'Confirmed approval name' });
    await saving; h.render();
    assert.equal(h.hook.isApproveOptionModalOpen, true); assert.equal(h.hook.isDirty, false);
    assert.equal(h.approvals.length, 0); assertVisibleSaveControls(h.hook);
    const approving = h.hook.confirmApproveOption(); void h.hook.confirmApproveOption(); await flush(); h.render();
    assert.equal(h.approvals.length, 1);
    assert.deepEqual(h.approvals[0].args, [
        '/admin/campaigns/proposal/synthetic-campaign/approve', undefined, { params: { optionIndex: 4 } },
    ]);
    assert.equal(h.hook.isApprovingOption, true); assert.equal(h.hook.canSave, false); assertVisibleSaveControls(h.hook);
    await h.resolveApproval(); await approving;
    assert.equal(h.statusNavigations.length, 1);
    assert.equal(h.statusNavigations[0].href, '/dashboard/campaigns/campaign-management/pending/synthetic-campaign?tab=strategy');
    assert.deepEqual(h.statusNavigations[0].options, { replace: true });
    assert.ok(h.invalidations.every(filter => filter.refetchType === 'none'));
});

test('Directly approve: Discard returns to confirmation and resets editors without approving', async () => {
    const h = createApprovalHarness(); await h.prepareApproval();
    h.hook.discardBeforeApprove(); h.render();
    assert.equal(h.hook.isApproveOptionModalOpen, true); assert.equal(h.hook.isDirty, false);
    assert.equal(h.hook.editorRevision, 1); assert.equal(h.saves.length, 0); assert.equal(h.approvals.length, 0);
    assert.equal(h.store.getState().draft.campaign.campaignName, 'Synthetic campaign'); assertVisibleSaveControls(h.hook);
    const approving = h.hook.confirmApproveOption(); await flush();
    assert.equal(h.approvals.length, 1); assert.equal(h.approvals[0].args[2].params.optionIndex, 4);
    await h.resolveApproval(); await approving;
});

test('Directly approve: Cancel and closing confirmation preserve dirty draft without Save or Approve', async () => {
    const h = createApprovalHarness(); await h.prepareApproval();
    const before = h.store.getState();
    h.hook.cancelApprovePreparation(); h.render();
    assert.equal(h.hook.isApproveOptionModalOpen, true); assert.equal(h.hook.isApproveUnsavedChangesModalOpen, false);
    assert.equal(h.hook.canSave, false); assertVisibleSaveControls(h.hook);
    h.hook.closeApproveOptionModal(); h.render(); await flush();
    assert.equal(h.store.getState(), before); assert.equal(h.hook.isDirty, true); assert.equal(h.hook.canSave, true);
    assert.equal(h.saves.length, 0); assert.equal(h.approvals.length, 0); assertVisibleSaveControls(h.hook);
});

test('Directly approve: failed Save remains in Unsaved changes and never approves', async () => {
    const h = createApprovalHarness(); await h.prepareApproval();
    const saving = h.hook.saveBeforeApprove();
    h.saves[0].reject(new Error('Save rejected')); await saving; h.render();
    assert.equal(h.hook.isApproveUnsavedChangesModalOpen, true); assert.equal(h.hook.isPreparingApproval, false);
    assert.equal(h.hook.isDirty, true); assert.equal(h.approvals.length, 0); assert.equal(h.statusNavigations.length, 0);
    assert.equal(h.notifications.length, 1); assert.equal(h.notifications[0].message, 'Save rejected');
});

test('option changes during Save prevent Copy even while the store still contains the old option', async () => {
    const h = createProposalHarness(); h.confirmCopy();
    const saving = h.hook.saveAndContinueProposalAction();
    h.context.optionIndex = 1; h.render();
    assert.equal(h.store.getState().draft.params.optionIndex, 0);
    h.saves[0].resolve(fixture('proposal').campaign); await saving;
    assert.equal(h.copies.length, 0); assert.deepEqual(h.navigations, []);
    assert.equal(h.context.optionIndex, 1);
});

test('Copy completion after unmount invalidates cache but cannot navigate or reopen dialogs', async () => {
    const h = createProposalHarness(); h.hook.createProposalCopy();
    h.lifecycle.unmount(); h.context.campaignId = 'another-campaign'; h.render();
    h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 2 }); await flush(); h.render();
    assert.deepEqual(h.navigations, []); assert.equal(h.context.campaignId, 'another-campaign');
    assert.equal(h.hook.isCreateOptionModalOpen, false); assert.equal(h.notifications.length, 0);
    assert.equal(h.invalidations.length, 2);
});

test('returning to the same context after unmount cannot revive Save and continue', async () => {
    const h = createProposalHarness(); h.confirmCopy();
    const saving = h.hook.saveAndContinueProposalAction();
    h.lifecycle.unmount(); h.render();
    h.saves[0].resolve(fixture('proposal').campaign); await saving;
    assert.equal(h.copies.length, 0); assert.deepEqual(h.navigations, []);
});

test('switching away and back in the mounted page cannot revive a pending Copy', async () => {
    const h = createProposalHarness(); h.hook.createProposalCopy();
    h.context.optionIndex = 1; h.render(); h.context.optionIndex = 0; h.render();
    h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 2 }); await flush();
    assert.deepEqual(h.navigations, []); assert.equal(h.context.optionIndex, 0);
});

test('Copy completion after leaving and remounting the same context cannot navigate', async () => {
    const h = createProposalHarness(); h.hook.createProposalCopy();
    h.lifecycle.unmount(); h.render();
    h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 2 }); await flush();
    assert.deepEqual(h.navigations, []); assert.equal(h.context.optionIndex, 0);
});

test('a rejected Switch URL update is handled without starting Save or Copy', async () => {
    const h = createProposalHarness(); h.navigationError = new Error('History write failed');
    h.hook.changeProposalOption(1); await flush();
    assert.equal(h.saves.length, 0); assert.equal(h.copies.length, 0);
    assert.match(h.notifications[0].message.props.children[0], /selected proposal option/);
    assert.equal(child(h.notifications[0].message, 'a').props.href.endsWith('proposal-option=1'), true);
});

for (const optimistic of [false, true]) {
    test(`created option URL failure offers a GET-only recovery (optimistic state: ${optimistic})`, async () => {
        const h = createProposalHarness(); h.navigationError = new Error('History write failed');
        h.optimisticNavigation = optimistic; h.confirmCopy();
        const saving = h.hook.saveAndContinueProposalAction();
        const saved = { ...fixture('proposal').campaign, campaignName: 'Saved response' };
        h.saves[0].resolve(saved); await saving; h.render();
        assert.equal(h.copies.length, 0); assert.equal(h.hook.isCreateOptionModalOpen, true);
        h.hook.createProposalCopy(); await flush();
        assert.equal(h.copies[0].args.body.campaignName, 'Saved response');
        h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 7 });
        await flush();
        assert.equal(h.notifications.length, 1);
        const { message, options } = h.notifications[0];
        assert.match(message.props.children[0], /was created/); assert.equal(options.autoClose, false);
        const link = child(message, 'a');
        const target = new URL(link.props.href, 'https://example.test');
        assert.equal(target.searchParams.get('proposal-option'), '7');
        // Following the ordinary href remounts the page at the confirmed server ID.
        h.lifecycle.unmount(); h.navigationError = null;
        h.context.optionIndex = Number(target.searchParams.get('proposal-option'));
        h.query = { data: saved, isFetchedAfterMount: true, isFetching: false, isError: false };
        h.render(); h.render();
        assert.equal(h.queries.at(-1).optionIndex, 7); assert.equal(h.hook.data.campaignName, 'Saved response');
        assert.equal(h.copies.length, 1); assert.equal(h.saves.length, 1);
    });
}

test('a failure after POST during cache invalidation is handled as an opening failure', async () => {
    const h = createProposalHarness(); h.invalidationError = new Error('Cache callback failed');
    h.hook.createProposalCopy();
    h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 3 }); await flush();
    assert.match(h.notifications[0].message.props.children[0], /was created/);
    assert.equal(child(h.notifications[0].message, 'a').props.href.endsWith('proposal-option=3'), true);
    assert.deepEqual(h.navigations, []); assert.equal(h.copies.length, 1);
});

test('GET failure after navigating to the created option remains a loading error without a second POST', async () => {
    const h = createProposalHarness(); h.hook.createProposalCopy();
    h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 4 }); await flush();
    h.query = { isError: true, isFetching: false, error: new Error('GET failed') }; h.render();
    assert.equal(h.hook.isError, true); assert.equal(h.hook.error.message, 'GET failed');
    assert.equal(h.hook.isCreateOptionModalOpen, false); assert.equal(h.notifications.length, 0);
    h.hook.createProposalCopy(); assert.equal(h.copies.length, 1);
});

test('View changes preserve Save preparation; explicit Copy failure does not roll back the saved baseline', async () => {
    const h = createProposalHarness(); h.confirmCopy();
    const saving = h.hook.saveAndContinueProposalAction();
    h.context.view = 'audience'; h.render();
    h.saves[0].resolve({ ...fixture('proposal').campaign, campaignName: 'Confirmed name' }); await saving; h.render();
    assert.equal(h.copies.length, 0); assert.equal(h.hook.isCreateOptionModalOpen, true);
    h.hook.createProposalCopy(); await flush();
    assert.equal(h.copies.length, 1);
    h.copies[0].reject(new Error('POST failed')); await flush();
    assert.equal(h.store.getState().baseline.campaign.campaignName, 'Confirmed name');
    assert.equal(loadComparison().selectCampaignIsDirty(h.store.getState()), false);
    assert.equal(h.notifications[0].message, 'POST failed'); assert.deepEqual(h.navigations, []);
});

test('failed Save stops continuation; Cancel preserves draft; Discard requires explicit Copy of baseline', async () => {
    const h = createProposalHarness(); h.confirmCopy();
    const saving = h.hook.saveAndContinueProposalAction();
    h.saves[0].reject(new Error('PATCH failed')); await saving; h.render();
    assert.equal(h.copies.length, 0); assert.equal(h.hook.isUnsavedChangesModalOpen, true);
    h.hook.cancelProposalAction(); h.render();
    assert.equal(h.hook.isCreateOptionModalOpen, true);
    assert.equal(h.store.getState().draft.campaign.campaignName, 'Unsaved name');
    h.hook.createProposalCopy(); h.render(); h.hook.discardAndContinueProposalAction(); h.render();
    assert.equal(h.copies.length, 0); assert.equal(h.hook.isCreateOptionModalOpen, true);
    h.hook.createProposalCopy();
    assert.equal(h.copies[0].args.body.campaignName, 'Synthetic campaign');
    h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 1 }); await flush();
});

test('Save then explicit Copy uses PATCH response and server option index before initializing from a full GET', async () => {
    const h = createProposalHarness();
    h.hook.openCreateOptionModal(); h.render(); assertVisibleSaveControls(h.hook);
    h.confirmCopy(); assertVisibleSaveControls(h.hook);
    const saving = h.hook.saveAndContinueProposalAction(); h.render();
    assert.equal(h.hook.isSaving, true); assert.equal(h.hook.isPending, false);
    assertVisibleSaveControls(h.hook);
    assert.equal(h.hook.data.campaignName, 'Unsaved name'); assert.equal(h.copies.length, 0);
    const saved = { ...fixture('proposal').campaign, campaignName: 'PATCH response' };
    h.saves[0].resolve(saved); await saving; h.render();
    assert.equal(h.copies.length, 0); assert.equal(h.hook.isCreateOptionModalOpen, true);
    assertVisibleSaveControls(h.hook);
    h.hook.createProposalCopy(); await flush();
    assert.equal(h.copies.length, 1); assert.equal(h.copies[0].args.body.campaignName, 'PATCH response');
    assert.equal(h.store.getState().baseline.campaign.campaignName, 'PATCH response');
    h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 8 }); await flush(); h.render();
    assert.deepEqual(h.navigations, [8]); assert.equal(h.hook.data, null); assert.equal(h.hook.isPending, true);
    assert.equal(h.store.getState().draft.params.optionIndex, 0);
    h.query = { data: { ...saved, campaignName: 'Full new option' }, isFetchedAfterMount: true, isFetching: false };
    h.render(); h.render();
    assert.equal(h.hook.data.campaignName, 'Full new option');
    assert.equal(h.store.getState().baseline.params.optionIndex, 8); assert.equal(h.hook.isDirty, false);
    assert.equal(h.saves.length, 1); assert.equal(h.copies.length, 1);
});

test('dirty Switch supports Cancel, Discard and Save without copying and resets only discarded editors', async () => {
    for (const decision of ['discard', 'save']) {
        const h = createProposalHarness(); h.store.getState().updateCampaignName('Unsaved switch'); h.render();
        h.hook.changeProposalOption(2); h.render();
        assert.equal(h.hook.isUnsavedChangesModalOpen, true);
        h.hook.cancelProposalAction(); h.render();
        assert.equal(h.hook.isUnsavedChangesModalOpen, false); assert.equal(h.hook.isCreateOptionModalOpen, false);
        assert.equal(h.store.getState().draft.campaign.campaignName, 'Unsaved switch');
        assert.deepEqual(h.navigations, []);
        h.hook.changeProposalOption(2); h.render();
        if (decision === 'discard') {
            h.hook.discardAndContinueProposalAction(); await flush(); h.render();
            assert.equal(h.store.getState().draft.campaign.campaignName, 'Synthetic campaign');
            assert.equal(h.hook.editorRevision, 1); assert.equal(h.saves.length, 0);
        } else {
            const saving = h.hook.saveAndContinueProposalAction();
            assert.deepEqual(h.navigations, []);
            h.saves[0].resolve({ ...fixture('proposal').campaign, campaignName: 'Saved switch' });
            await saving; h.render();
            assert.equal(h.store.getState().draft.campaign.campaignName, 'Saved switch');
            assert.equal(h.hook.editorRevision, 0); assert.equal(h.saves.length, 1);
        }
        assert.deepEqual(h.navigations, [2]); assert.equal(h.copies.length, 0);
    }
});

test('matching persisted draft is available through loading and background GET without replacing edits', () => {
    const memory = new Map(), first = createStore(memory);
    first.getState().initializeDraft(fixture('proposal')); first.getState().updateCampaignName('Persisted edit');
    const restored = createStore(memory), h = createProposalHarness(restored), before = restored.getState();
    h.query = { data: { ...fixture('proposal').campaign, campaignName: 'Background data' }, isFetching: true };
    h.render();
    assert.equal(h.hook.data.campaignName, 'Persisted edit'); assert.equal(h.hook.isPending, false);
    h.query = { ...h.query, isFetching: false, isFetchedAfterMount: true }; h.render();
    assert.equal(restored.getState(), before); assert.equal(h.hook.isDirty, true);
    assert.equal(h.hook.data.campaignName, 'Persisted edit');
});

test('draft initialization waits for a fresh settled successful query, including after option changes', () => {
    const h = createProposalHarness(createStore());
    for (const result of [
        { isFetchedAfterMount: false, isFetching: false },
        { isFetchedAfterMount: true, isFetching: true },
        { isFetchedAfterMount: true, isFetching: false, isError: true, error: new Error('GET failed') },
    ]) {
        h.query = { data: fixture('proposal').campaign, ...result }; h.render();
        assert.equal(h.hook.data, null); assert.equal(h.store.getState().draft, null);
    }
    h.query = { data: fixture('proposal').campaign, isFetchedAfterMount: true, isFetching: false };
    h.render(); h.render();
    assert.equal(h.hook.data.campaignName, 'Synthetic campaign');
    h.context.optionIndex = 3;
    h.query = { data: { ...fixture('proposal').campaign, campaignName: 'Cached option' }, isFetchedAfterMount: false, isFetching: false };
    h.render();
    assert.equal(h.hook.data, null); assert.equal(h.store.getState().draft.params.optionIndex, 0);
    h.query = { ...h.query, data: { ...h.query.data, campaignName: 'Fresh option' }, isFetchedAfterMount: true };
    h.render(); h.render();
    assert.equal(h.hook.data.campaignName, 'Fresh option'); assert.equal(h.hook.isDirty, false);
    assert.equal(h.store.getState().baseline.params.optionIndex, 3);
});

test('pending request context initializes an under_review response without changing edit permissions', () => {
    const h = createProposalHarness(createStore()); h.context.status = 'pending';
    h.query = { data: fixture('under_review').campaign, isFetchedAfterMount: true, isFetching: false };
    h.render(); h.render();
    assert.equal(h.hook.data.status, 'under_review'); assert.equal(h.store.getState().draft.params.status, 'pending');
    assert.equal(h.hook.canSave, false); assert.equal(h.hook.isReadOnly, false);
    assert.equal(h.hook.canMarkAsPaid, false); assert.equal(h.hook.isDirty, false);
    h.hook.updateCampaignName('Dirty Under Review draft'); h.render();
    assert.equal(h.hook.isDirty, true); assert.equal(h.hook.canSave, true);
});

test('pure Paid transformation preserves unrelated placements and only no-ops when both fields match', () => {
    const { applyPromoPaidToCampaign } = loadPaidHelper();
    const campaign = fixture().campaign, before = plain(campaign);
    const result = { campaignId: campaign.campaignId, promoId: 'placement-a', closePromo: 'wait', statusLabel: 'Paid' };
    const updated = applyPromoPaidToCampaign(campaign, result);
    assert.notEqual(updated, campaign); assert.equal(updated.addedAccounts[0].statusLabel, 'Paid');
    assert.equal(updated.addedAccounts[1], campaign.addedAccounts[1]);
    assert.equal(updated.campaignContent, campaign.campaignContent); assert.deepEqual(campaign, before);
    assert.equal(applyPromoPaidToCampaign(updated, result), updated);
    assert.equal(applyPromoPaidToCampaign(campaign, { ...result, promoId: 'missing-placement' }), campaign);
    assert.equal(applyPromoPaidToCampaign(campaign, { ...result, promoId: 'same-social-account' }), campaign);
});

function createDraftLifecycleHarness(store, pathname = '/dashboard/campaigns/campaign-management/proposal/synthetic-campaign') {
    const lifecycle = createHookLifecycle();
    const h = { pathname, auth: 'authenticated' };
    const router = require('react-router-dom');
    const { CampaignDraftLifecycle } = loadUI('src/app/providers/router/campaign-draft-lifecycle.tsx', lifecycle.react, {
        'react-router-dom': { useLocation: () => h, matchPath: router.matchPath },
        '@/pages/campaign-management-v2/store/campaign-management.store': { useCampaignManagementStore: store },
    });
    const { ROUTER } = loadUI('src/app/providers/router/router.tsx', {}, {
        'react-router-dom': { createBrowserRouter: routes => routes, Outlet: 'Outlet' },
        '@/app/providers/router/campaign-draft-lifecycle.tsx': { CampaignDraftLifecycle },
    });
    assert.equal(ROUTER[0].element.type, CampaignDraftLifecycle);
    assert.equal(ROUTER[0].element.props.children.type, 'Outlet');
    const { ProtectedOnly } = loadUI('src/app/providers/router/guards.tsx', {}, {
        '@/app/providers/auth-provider/use-auth.ts': { useAuth: () => ({ status: h.auth, isAuthReady: h.auth !== 'booting' }) },
        'react-router-dom': { useLocation: () => h, Navigate: 'Navigate', Outlet: 'Outlet' },
    });
    h.render = () => lifecycle.render(() => CampaignDraftLifecycle(ROUTER[0].element.props));
    h.exitThroughGuard = () => {
        h.auth = 'anonymous';
        const redirect = ProtectedOnly(); assert.equal(redirect.type, 'Navigate');
        h.pathname = redirect.props.to; h.render();
    };
    h.lifecycle = lifecycle; h.render(); return h;
}

test('initial root entry clears hydrated snapshots outside their flow without mounting the list page', () => {
    for (const pathname of [
        '/dashboard/campaigns', '/login', '/dashboard/clients', '/dashboard/create-new-campaign',
        '/dashboard/campaigns/campaign-management/proposal/another-campaign',
        '/dashboard/campaigns/campaign-management/distributing/synthetic-campaign',
    ]) {
        const memory = new Map(), first = createStore(memory);
        first.getState().initializeDraft(fixture('proposal')); first.getState().updateCampaignName('Persisted edit');
        const restored = createStore(memory);
        assert.equal(restored.getState().draft.campaign.campaignName, 'Persisted edit');
        createDraftLifecycleHarness(restored, pathname);
        assert.equal(restored.getState().draft, null); assert.equal(restored.getState().baseline, null);
        const persisted = JSON.parse(memory.get('campaign-management-draft')).state;
        assert.equal(persisted.draft, null); assert.equal(persisted.baseline, null);
    }
});

test('root lifecycle survives auth guard exit and clears baseline, draft and persisted snapshots', () => {
    const memory = new Map(), store = createStore(memory);
    store.getState().initializeDraft(fixture('proposal')); store.getState().updateCampaignName('Unsaved');
    const h = createDraftLifecycleHarness(store); h.exitThroughGuard();
    assert.equal(store.getState().draft, null); assert.equal(store.getState().baseline, null);
    const persisted = JSON.parse(memory.get('campaign-management-draft')).state;
    assert.equal(persisted.draft, null); assert.equal(persisted.baseline, null);
});

test('F5 hydration, auth boot and StrictMode replay preserve matching draft; child routes and View stay in process', () => {
    const memory = new Map(), first = createStore(memory);
    first.getState().initializeDraft(fixture('proposal')); first.getState().updateCampaignName('Persisted edit');
    const restored = createStore(memory), h = createDraftLifecycleHarness(restored);
    h.auth = 'booting'; h.render(); h.lifecycle.replayEffects();
    h.pathname += '/future-child'; h.render(); h.view = 'audience'; h.render();
    assert.equal(restored.getState().draft.campaign.campaignName, 'Persisted edit');
    assert.equal(restored.getState().baseline.campaign.campaignName, 'Synthetic campaign');
    h.pathname = '/dashboard/campaigns'; h.render();
    assert.equal(restored.getState().draft, null);
});

test('leaving for another section clears draft; new entry ignores cached data until a fresh successful GET', () => {
    const store = initialized('proposal').store, lifecycle = createDraftLifecycleHarness(store);
    store.getState().updateCampaignName('Discard on exit');
    lifecycle.pathname = '/dashboard/clients'; lifecycle.render();
    assert.equal(store.getState().draft, null);
    const h = createProposalHarness(store);
    h.query = { data: fixture('proposal').campaign, isFetchedAfterMount: false, isFetching: false }; h.render();
    assert.equal(h.hook.data, null); assert.equal(store.getState().draft, null);
    h.query = { data: { ...fixture('proposal').campaign, campaignName: 'Fresh GET' }, isFetchedAfterMount: true, isFetching: false };
    h.render(); h.render();
    assert.equal(h.hook.data.campaignName, 'Fresh GET');
    assert.equal(store.getState().baseline.campaign.campaignName, 'Fresh GET');
});

function createPaidHarness() {
    const { QueryClient, MutationObserver } = require('@tanstack/react-query');
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const { store } = initialized();
    const requests = [], notifications = [];
    const key = ['details', { campaignId: 'synthetic-campaign', status: 'distributing' }];
    client.setQueryData(key, fixture().campaign);
    const onPaid = loadPageHook(store, 'distributing', client).onPromoPaid;
    const mount = (promoId, campaignId = 'synthetic-campaign') => {
        const lifecycle = createHookLifecycle();
        const { MarkPromoAsPaid } = loadUI('src/features/campaign-management/mark-promo-as-paid/ui/mark-promo-as-paid.tsx', {}, {
            '@tanstack/react-query': {
                useQueryClient: () => client,
                useIsMutating: filters => client.isMutating(filters),
                useMutation: options => {
                    const ref = lifecycle.react.useRef(null);
                    ref.current ??= new MutationObserver(client, options);
                    const observer = ref.current;
                    observer.setOptions(options);
                    lifecycle.react.useEffect(() => observer.subscribe(() => {}), [observer]);
                    return { mutate: variables => { void observer.mutate(variables).catch(() => {}); } };
                },
            },
            '@/entities/campaign': { markPromoAsPaid: args => new Promise((resolve, reject) => requests.push({ args, resolve, reject })) },
            'react-toastify': { toast: message => notifications.push(message) },
        });
        return {
            unmount: lifecycle.unmount,
            render: () => lifecycle.render(() => MarkPromoAsPaid({
                campaignId, promoId, canMarkAsPaid: true, onPaid,
                closePromo: store.getState().draft.campaign.addedAccounts.find(account => account.addedAccountsId === promoId)?.closePromo ?? 'wait',
            })),
        };
    };
    return { client, store, requests, notifications, mount, key };
}

for (const outcome of ['success', 'error']) {
    test(`Paid pending survives remount, isolates campaign/promo and ends on ${outcome}`, async t => {
        const h = createPaidHarness(); t.after(() => h.client.clear());
        h.store.getState().updateCampaignName('Keep local edit');
        const first = h.mount('placement-a'), oldClick = child(first.render(), 'button').props.onClick;
        oldClick(); oldClick(); await flush();
        assert.equal(h.requests.length, 1);
        first.unmount();
        const remounted = h.mount('placement-a');
        assert.equal(remounted.render().props['aria-busy'], true);
        assert.equal(child(remounted.render(), 'button'), undefined);
        oldClick(); await flush(); assert.equal(h.requests.length, 1);
        const anotherCampaign = h.mount('placement-a', 'other-campaign');
        assert.equal(child(anotherCampaign.render(), 'button').props.disabled, false);
        const other = h.mount('placement-b');
        child(other.render(), 'button').props.onClick(); await flush();
        assert.equal(h.requests.length, 2);
        assert.deepEqual(h.requests.map(request => request.args.promoId), ['placement-a', 'placement-b']);
        if (outcome === 'success') {
            h.requests[0].resolve({ campaignId: 'synthetic-campaign', promoId: 'placement-a', closePromo: 'close', statusLabel: 'Paid' });
        } else {
            h.requests[0].reject(new Error('Paid failed'));
        }
        await flush();
        const completed = remounted.render();
        assert.equal(completed.props['aria-busy'], false);
        assert.equal(child(completed, 'button').props.disabled, outcome === 'success');
        assert.equal(other.render().props['aria-busy'], true);
        assert.equal(h.store.getState().draft.campaign.campaignName, 'Keep local edit');
        assert.equal(h.store.getState().baseline.campaign.addedAccounts[0].closePromo, outcome === 'success' ? 'close' : 'wait');
        assert.equal(h.client.getQueryData(h.key).addedAccounts[0].closePromo, outcome === 'success' ? 'close' : 'wait');
        h.requests[1].reject(new Error('Other Paid failed')); await flush();
        assert.equal(other.render().props['aria-busy'], false);
        assert.equal(h.client.isMutating(), 0);
        remounted.unmount(); other.unmount(); anotherCampaign.unmount();
    });
}

for (const [field, message] of [['addedAccounts', 'without accounts'], ['campaignContent', 'without content']]) {
    test(`ordinary Save preparation failure for ${field} notifies once without PATCH or changing draft`, async () => {
        // Keep real dirty detection: an empty list must reach Save's mapper validation.
        const { store } = initialized('pending');
        store.setState({ draft: { ...store.getState().draft, campaign: { ...store.getState().draft.campaign, [field]: [] } } });
        const before = store.getState(), h = createProposalHarness(store);
        h.context.status = 'pending'; h.render(); h.hook.saveCampaign(); h.render();
        assert.equal(h.hook.isSaving, true); await flush(); h.render();
        assert.equal(h.hook.isSaving, false); assert.equal(h.saves.length, 0);
        assert.equal(h.store.getState().draft, before.draft); assert.equal(h.store.getState().baseline, before.baseline);
        assert.equal(h.notifications.length, 1); assert.match(h.notifications[0].message, new RegExp(message));
    });
}

function interceptorRejection(h, error, options) {
    let rejectResponse;
    const { setupInterceptors } = loadSource('src/app/api/interceptors.ts', {
        './http': { $api: { interceptors: {
            request: { use() { return 0; }, eject() {} },
            response: { use(_success, reject) { rejectResponse = reject; return 0; }, eject() {} },
        } } },
        './errors/notify': h.errorNotifications,
        '@/app/api/auth/token-storage.ts': { tokenStorage: { get: () => null } },
        '@/app/api/refresh.manager.ts': { refreshAccessToken: async () => { throw new Error('Unexpected refresh'); } },
    });
    setupInterceptors(() => {}, () => {}, options);
    return rejectResponse(error).catch(rejected => rejected);
}

function httpError(status = 422) {
    const { AxiosError } = require('axios');
    return new AxiosError('HTTP request failed', 'ERR_BAD_RESPONSE', { url: '/admin/campaigns/proposal/synthetic-campaign', _retry: true }, {}, {
        status, data: { message: 'Backend rejected operation' }, headers: {},
    });
}

for (const action of ['copy', 'switch']) {
    test(`HTTP Save error is notified once and stops ${action}`, async () => {
        const h = createProposalHarness();
        if (action === 'copy') h.confirmCopy();
        else {
            h.store.getState().updateCampaignName('Unsaved'); h.render(); h.hook.changeProposalOption(1); h.render();
        }
        const before = h.store.getState().draft, saving = h.hook.saveAndContinueProposalAction();
        h.saves[0].reject(await interceptorRejection(h, httpError())); await saving; h.render();
        assert.equal(h.notifications.length, 1); assert.equal(h.notifications[0].message, 'Backend rejected operation');
        assert.equal(h.hook.isSaving, false); assert.equal(h.store.getState().draft, before);
        assert.equal(h.copies.length, 0); assert.deepEqual(h.navigations, []);
    });
}

test('HTTP POST error is notified once and does not navigate', async () => {
    const h = createProposalHarness(); h.hook.createProposalCopy();
    h.copies[0].reject(await interceptorRejection(h, httpError())); await flush(); h.render();
    assert.equal(h.notifications.length, 1); assert.equal(h.notifications[0].message, 'Backend rejected operation');
    assert.equal(h.hook.isCreatingOption, false); assert.deepEqual(h.navigations, []);
});

for (const [label, status, options] of [['notification disabled', 422, { notify: false }], ['ignored unauthorized', 401, undefined]]) {
    test(`HTTP error remains visible locally when interceptor ${label}`, async () => {
        const h = createProposalHarness(); h.confirmCopy();
        const saving = h.hook.saveAndContinueProposalAction();
        const error = await interceptorRejection(h, httpError(status), options);
        assert.equal(h.notifications.length, 0);
        h.saves[0].reject(error); await saving;
        assert.equal(h.notifications.length, 1); assert.equal(h.notifications[0].message, 'Backend rejected operation');
        assert.equal(h.copies.length, 0); assert.deepEqual(h.navigations, []);
    });
}

test('Copy mapper errors remain visible without POST', async () => {
    const store = createStore(), input = fixture('proposal');
    input.campaign.addedAccounts[0].selectedContent = null;
    store.getState().initializeDraft(input);
    const h = createProposalHarness(store); h.hook.createProposalCopy(); await flush(); h.render();
    assert.equal(h.copies.length, 0); assert.equal(h.notifications.length, 1);
    assert.match(h.notifications[0].message, /selected content is missing/);
    assert.equal(h.hook.isCreatingOption, false);
});

test('Add placeholder is a disabled button without navigation or draft changes', () => {
    const { store } = initialized('proposal'), before = store.getState();
    const { CampaignAccountsList } = loadUI(listFile, initialReact);
    const tree = CampaignAccountsList({
        readOnly: false, accounts: before.draft.campaign.addedAccounts,
        campaignContent: before.draft.campaign.campaignContent, selectedAddedAccountsId: 'placement-a',
        onAccountSelect: () => assert.fail('Add must not change selection'),
    });
    const add = elements(tree, element => element.props['aria-label'] === 'Add account')[0];
    assert.equal(add.type, 'button'); assert.equal(add.props.type, 'button'); assert.equal(add.props.disabled, true);
    assert.equal(add.props.href, undefined); assert.equal(add.props.to, undefined); assert.equal(add.props.onClick, undefined);
    assert.equal(store.getState(), before);
});

const createInsightsHarness = (status = 'distributing') => createWhatsAppHarness(status, true);
function refreshedInsights(h) {
    const campaign = structuredClone(h.input.campaign);
    Object.assign(campaign, {
        campaignName: 'Server name', price: 9999, totalFollowers: 9999,
        totalImpressions: 0, totalLikes: 3, totalComments: 6, totalShares: 9, totalSaves: 12, cpm: 0,
    });
    campaign.addedAccounts.forEach((account, i) => Object.assign(account, {
        impressions: 0, like: i, comments: i * 2, shares: i * 3, saves: i * 4, cpm: i,
        postLink: 'https://example.test/server-post', screenshot: '', rating: 1000, followers: 9999,
        closePromo: 'close', statusLabel: 'Server status', whatsappStatus: 'sent',
    }));
    campaign.addedAccounts.reverse();
    return campaign;
}
async function finishInsights(h, campaign = refreshedInsights(h)) {
    h.scrapes.at(-1).resolve(); await flush();
    h.gets.at(-1).resolve(campaign); await flush(); h.render();
}

// Exercise real page callbacks, including those retained by open forms / async uploads.
function attemptCampaignEdits(hook) {
    hook.updateCampaignName('Forbidden edit');
    hook.setPriceHidden(true); hook.setCpmAndResultHidden(true);
    hook.setPrice(500); hook.setDisplayCurrency('USD');
    hook.setAccountSelectedContent('placement-a', 'content-b');
    hook.setAccountSelectedDescription('placement-a', 'content-a-d2');
    hook.setAccountSelectedBrief('placement-a', 'content-a-b2');
    hook.setAccountDateRequest('placement-a', '2026-11-01');
    hook.setAccountPostLink('placement-a', 'https://example.test/late');
    hook.setAccountScreenshot('placement-a', 'https://example.test/uploaded');
    hook.onCreateContentForAccount('placement-a', 'https://example.test/new');
    hook.onCreateDescriptionForAccount('placement-a', 'New description');
    hook.onCreateBriefForAccount('placement-a', 'New brief');
    hook.onUpdateDescriptionForAccount('content-a', 'content-a-d1', 'Changed');
    hook.onUpdateBriefForAccount('content-a', 'content-a-b1', 'Changed');
    hook.onUpdateContentTaggedUser('content-a', '@changed');
    hook.onUpdateContentTaggedLink('content-a', 'https://example.test/changed');
    for (const field of fields) hook.onUpdateAccountMetricField('placement-a', field, 500);
    hook.deleteContentDescription('content-a', 'content-a-d1');
    hook.deleteContentBrief('content-a', 'content-a-b1');
    hook.deleteCampaignContent('content-a'); hook.removeAccount('placement-a');
    hook.resetDraft(); hook.saveCampaign(); hook.requestCloseCampaign();
}

function assertFullInsightsSnapshot(h, refreshed) {
    const { baseline, draft, meta } = h.store.getState();
    assert.deepEqual(baseline.campaign, refreshed);
    assert.deepEqual(draft.campaign, refreshed);
    assert.deepEqual(h.queryClient.getQueryData(h.cacheKey), refreshed);
    assert.notEqual(baseline, draft); assert.notEqual(baseline.campaign, draft.campaign);
    assert.notEqual(draft.campaign, refreshed);
    assert.notEqual(baseline.campaign.addedAccounts, draft.campaign.addedAccounts);
    assert.notEqual(baseline.campaign.campaignContent[0], draft.campaign.campaignContent[0]);
    assert.equal(typeof meta.updatedAt, 'number');
    assert.equal(meta.expiresAt - meta.updatedAt, 2 * 60 * 60 * 1000);
    assert.equal(h.hook.isDirty, false);
}

test('Insights: API sends PATCH with just campaignId/name, silent errors and no response dependency', async () => {
    const requests = [];
    const api = loadSource('src/entities/campaign/api/campaign.api.ts', {
        '@/app/api/http.ts': { $api: { patch: async (...args) => { requests.push(args); } } },
    });
    await api.updateCampaignInsights({ campaignId: 'synthetic', campaignName: 'Current name' }, { silentError: true });
    assert.deepEqual(requests, [[ '/scrapers/post-details/all',
        { campaignId: 'synthetic', campaignName: 'Current name' }, { silentError: true, timeout: 0 } ]]);
});

test('Insights: only distributing with matching draft AND baseline can start', async () => {
    for (const status of ['pending', 'completed', 'proposal']) {
        const h = createInsightsHarness(status); h.hook.requestUpdateInsights(); await flush();
        assert.equal(h.scrapes.length, 0); assert.equal(h.hook.canUpdateInsights, false);
    }
    for (const change of [
        () => ({ draft: null }),
        () => ({ baseline: null }),
        state => ({ draft: { ...state.draft, params: { ...state.draft.params, status: 'completed' } } }),
        state => ({ draft: { ...state.draft, params: { ...state.draft.params, campaignId: 'other' } } }),
        state => ({ baseline: { ...state.baseline, params: { ...state.baseline.params, campaignId: 'other' } } }),
    ]) {
        const h = createInsightsHarness();
        h.store.setState(change(h.store.getState()));
        h.hook.requestUpdateInsights(); await flush(); assert.equal(h.scrapes.length, 0);
    }
});

test('Insights: clean draft sends one PATCH then GET; all locks last through GET without changing readOnly', async () => {
    const h = createInsightsHarness(), before = h.store.getState();
    const stale = h.hook;
    stale.requestUpdateInsights(); stale.requestUpdateInsights(); await flush(); h.render();
    assert.equal(h.scrapes.length, 1); assert.equal(h.gets.length, 0);
    assert.equal(h.hook.isUpdatingInsights, true); assert.equal(h.hook.isInsightsLocked, true);
    assert.equal(h.hook.canUpdateInsights, true); assert.equal(h.hook.isReadOnly, false);
    assert.equal(h.hook.canSave, false); assert.equal(h.hook.canReset, false);
    assert.equal(h.hook.canEditMetrics, false); assert.equal(h.hook.canEditPostDetails, false);
    assert.equal(h.hook.canMarkAsPaid, false);
    attemptCampaignEdits(stale); attemptCampaignEdits(h.hook);
    assert.equal(h.store.getState(), before); assert.equal(h.saves.length, 0);
    h.scrapes[0].resolve(); await flush(); h.render();
    assert.equal(h.gets.length, 1); assert.equal(h.hook.isInsightsLocked, true);
    attemptCampaignEdits(stale); attemptCampaignEdits(h.hook);
    assert.equal(h.store.getState(), before);
    stale.requestUpdateInsights(); assert.equal(h.scrapes.length, 1);
    h.gets[0].resolve(refreshedInsights(h)); await flush(); h.render();
    assert.equal(h.hook.isInsightsLocked, false); assert.equal(h.hook.canReset, true);
    assert.equal(h.hook.isDirty, false); assert.equal(h.notifications.length, 1);
    const accepted = h.store.getState();
    attemptCampaignEdits(stale);
    assert.equal(h.store.getState(), accepted, 'late callbacks cannot restore pre-refresh form values');
    h.hook.updateCampaignName('A new edit after completion');
    assert.equal(h.store.getState().draft.campaign.campaignName, 'A new edit after completion');
    assert.match(h.notifications[0].message, /Processing completed.*Saved campaign metrics/);
});

test('Insights: dirty Cancel preserves edits; Discard resets editors and continues with baseline name', async () => {
    const h = createInsightsHarness(); h.store.getState().updateCampaignName('Unsaved name'); h.render();
    h.hook.requestUpdateInsights(); h.render();
    assert.equal(h.hook.isInsightsUnsavedChangesModalOpen, true); assert.equal(h.scrapes.length, 0);
    assert.equal(h.hook.isInsightsLocked, false); assert.equal(h.hook.isReadOnly, false);
    h.hook.cancelInsightsPreparation(); h.render();
    assert.equal(h.hook.isDirty, true); assert.equal(h.scrapes.length, 0);
    h.hook.requestUpdateInsights(); h.render(); h.hook.discardAndContinueInsights(); await flush(); h.render();
    assert.equal(h.scrapes.length, 1); assert.equal(h.saves.length, 0); assert.equal(h.hook.editorRevision, 1);
    assert.equal(h.scrapes[0].args.body.campaignName, h.input.campaign.campaignName);
    await finishInsights(h);
});

for (const success of [true, false]) test(`Insights: Save ${success ? 'success continues using saved name' : 'failure stops PATCH'}`, async () => {
    const h = createInsightsHarness(); h.store.getState().updateCampaignName('Unsaved name'); h.render();
    h.hook.requestUpdateInsights(); h.render(); h.hook.saveAndContinueInsights(); h.hook.saveAndContinueInsights();
    await flush(); assert.equal(h.saves.length, 1); assert.equal(h.scrapes.length, 0);
    if (success) h.saves[0].resolve({ ...structuredClone(h.input.campaign), campaignName: 'Confirmed name' });
    else h.saves[0].reject(new Error('Save failed'));
    await flush(); h.render();
    assert.equal(h.scrapes.length, success ? 1 : 0);
    if (success) { assert.equal(h.scrapes[0].args.body.campaignName, 'Confirmed name'); await finishInsights(h); }
    else { assert.equal(h.hook.isInsightsUnsavedChangesModalOpen, true); assert.equal(h.hook.isUpdatingInsights, false); }
});

test('Insights: a concurrent Save or Paid mutation blocks starting even before rerender', async () => {
    for (const [mutationKey, variables] of [
        [['campaigns', 'save'], { params: { campaignId: 'synthetic-campaign' } }],
        [['campaigns', 'mark-promo-as-paid', { campaignId: 'synthetic-campaign', promoId: 'placement-a' }], { campaignId: 'synthetic-campaign', promoId: 'placement-a' }],
    ]) {
        const h = createInsightsHarness(); let complete;
        const pending = h.queryClient.getMutationCache().build(h.queryClient, {
            mutationKey, mutationFn: () => new Promise(resolve => { complete = resolve; }),
        }).execute(variables);
        h.hook.requestUpdateInsights(); await flush(); h.render();
        assert.equal(h.scrapes.length, 0); assert.equal(h.hook.isUpdateInsightsDisabled, true);
        complete(); await pending;
    }
});

test('Insights: preparation Save blocks all edits immediately and continuously through PATCH and GET', async () => {
    const h = createInsightsHarness(); h.hook.updateCampaignName('Submitted name'); h.render();
    const stale = h.hook;
    h.hook.requestUpdateInsights(); h.render(); h.hook.saveAndContinueInsights();
    const before = h.store.getState();
    attemptCampaignEdits(stale);
    assert.equal(h.store.getState(), before, 'guard works before React rerenders');
    await flush(); h.render();
    assert.equal(h.hook.isPreparingInsights, true); assert.equal(h.hook.isInsightsLocked, true);
    assert.equal(h.hook.isReadOnly, false); assert.equal(h.hook.canSave, false);
    attemptCampaignEdits(h.hook); assert.equal(h.store.getState(), before);
    const unsubscribe = h.store.subscribe(() => assert.equal(stale.isInsightsActionBlocked(), true));
    h.saves[0].resolve({ ...structuredClone(h.input.campaign), campaignName: 'Submitted name' });
    await flush(); h.render();
    assert.equal(h.scrapes.length, 1); assert.equal(h.saves.length, 1);
    assert.equal(h.hook.isInsightsLocked, true); assert.equal(h.hook.isDirty, false);
    assert.equal(h.store.getState().baseline.campaign.campaignName, 'Submitted name');
    await finishInsights(h); unsubscribe();
    assert.equal(h.hook.isInsightsLocked, false);
});

test('Insights: status change or leaving and returning during Save cannot resume scraping', async () => {
    for (const change of ['status', 'leave-and-return']) {
        const h = createInsightsHarness(); h.hook.updateCampaignName('Save first'); h.render();
        h.hook.requestUpdateInsights(); h.render(); h.hook.saveAndContinueInsights(); await flush();
        if (change === 'status') {
            const state = h.store.getState();
            h.store.setState({ draft: { ...state.draft, params: { ...state.draft.params, status: 'completed' } } });
        } else {
            h.context = { ...h.input.params, campaignId: 'other' }; h.render();
            h.context = h.input.params; h.render();
        }
        h.saves[0].resolve(structuredClone(h.input.campaign)); await flush(); h.render();
        assert.equal(h.scrapes.length, 0);
    }
});

test('Insights: repeated GET failure stays locked without another PATCH or Save', async () => {
    const h = createInsightsHarness(); h.hook.requestUpdateInsights(); await flush();
    h.scrapes[0].resolve(); await flush(); h.gets[0].reject(new Error('GET failed')); await flush(); h.render();
    h.hook.retryInsightsRefresh(); await flush(); h.gets[1].reject(new Error('Still unavailable')); await flush(); h.render();
    assert.equal(h.hook.isUpdatingInsights, false); assert.equal(h.hook.needsInsightsRefresh, true);
    assert.equal(h.hook.isInsightsLocked, true); assert.equal(h.scrapes.length, 1); assert.equal(h.saves.length, 0);
    h.hook.retryInsightsRefresh(); await flush(); h.gets[2].resolve(refreshedInsights(h)); await flush(); h.render();
    assert.equal(h.hook.isInsightsLocked, false);
});

test('Insights: PATCH error reports once, releases locks, never automatically retries or GETs', async () => {
    const h = createInsightsHarness(); h.hook.requestUpdateInsights(); await flush();
    h.scrapes[0].reject(new Error('Unconfirmed timeout')); await flush(); h.render();
    assert.equal(h.hook.isInsightsLocked, false); assert.equal(h.hook.needsInsightsRefresh, false);
    assert.equal(h.gets.length, 0); assert.equal(h.scrapes.length, 1); assert.equal(h.notifications.length, 1);
    assert.equal(h.notifications[0].type, 'error'); assert.match(h.notifications[0].message, /may have changed/);
});

test('Insights: failed GET retains full editing lock across remount; GET-only retry replaces the campaign', async () => {
    const h = createInsightsHarness(); h.hook.requestUpdateInsights(); await flush(); h.scrapes[0].resolve(); await flush();
    h.gets[0].reject(new Error('GET failed')); await flush(); h.render();
    assert.equal(h.hook.needsInsightsRefresh, true); assert.equal(h.hook.isUpdatingInsights, false);
    h.lifecycle.unmount(); h.render();
    assert.equal(h.hook.isInsightsLocked, true); assert.equal(h.hook.needsInsightsRefresh, true);
    const before = h.store.getState();
    attemptCampaignEdits(h.hook); assert.equal(h.store.getState(), before);
    h.hook.requestUpdateInsights(); h.hook.retryInsightsRefresh(); h.hook.retryInsightsRefresh(); await flush(); h.render();
    assert.equal(h.scrapes.length, 1); assert.equal(h.gets.length, 2); assert.equal(h.saves.length, 0);
    assert.equal(h.hook.isInsightsLocked, true); assert.equal(h.hook.needsInsightsRefresh, true);
    const refreshed = refreshedInsights(h);
    h.gets[1].resolve(refreshed); await flush(); h.render();
    assert.equal(h.hook.isInsightsLocked, false); assertFullInsightsSnapshot(h, refreshed);
});

test('Insights: full server snapshots replace all fields, order, zero/decreased metrics and reset metadata', async () => {
    const h = createInsightsHarness(); h.hook.requestUpdateInsights(); await flush();
    const before = h.store.getState(), refreshed = refreshedInsights(h);
    refreshed.campaignContent[0].descriptions[0].description = 'Server description';
    refreshed.isPriceHidden = true; refreshed.isCpmAndResultHidden = true;
    await finishInsights(h, refreshed);
    assertFullInsightsSnapshot(h, refreshed);
    assert.notEqual(h.store.getState().meta, before.meta);
    assert.equal(h.hook.editorRevision, 1);
});

for (const change of ['removed', 'added']) test(`Insights: ${change} server placements are accepted without matching local composition`, async () => {
    const h = createInsightsHarness(), refreshed = refreshedInsights(h);
    if (change === 'removed') refreshed.addedAccounts.pop();
    else refreshed.addedAccounts.push({ ...refreshed.addedAccounts[0], addedAccountsId: 'extra' });
    h.hook.requestUpdateInsights(); await flush(); await finishInsights(h, refreshed);
    assertFullInsightsSnapshot(h, refreshed);
    assert.equal(h.hook.needsInsightsRefresh, false);
    assert.equal(h.scrapes.length, 1); assert.equal(h.hook.isInsightsLocked, false);
});

for (const stage of ['Save', 'PATCH', 'GET']) test(`Insights: switching campaigns during ${stage} never changes the other draft`, async () => {
    const h = createInsightsHarness();
    if (stage === 'Save') { h.hook.updateCampaignName('Save first'); h.render(); }
    h.hook.requestUpdateInsights(); h.render();
    if (stage === 'Save') h.hook.saveAndContinueInsights();
    await flush();
    if (stage === 'GET') { h.scrapes[0].resolve(); await flush(); }
    const other = fixture(); other.params.campaignId = other.campaign.campaignId = 'other-campaign';
    h.context = other.params; h.store.getState().initializeDraft(other); h.render();
    const before = h.store.getState();
    const editorRevision = h.hook.editorRevision;
    if (stage === 'Save') h.saves[0].resolve(structuredClone(h.input.campaign));
    else {
        if (stage === 'PATCH') { h.scrapes[0].resolve(); await flush(); }
        h.gets[0].resolve(refreshedInsights(h));
    }
    await flush(); h.render();
    assert.equal(h.store.getState(), before); assert.equal(h.hook.isInsightsLocked, false);
    assert.equal(h.hook.editorRevision, editorRevision, 'completion must not reset campaign B editors');
    assert.equal(h.scrapes.length, stage === 'Save' ? 0 : 1);
});

test('Insights: remount while PATCH or GET is pending keeps its spinner and prevents second PATCH', async () => {
    for (const stage of ['PATCH', 'GET']) {
        const h = createInsightsHarness(); h.hook.requestUpdateInsights(); await flush();
        if (stage === 'GET') { h.scrapes[0].resolve(); await flush(); }
        h.lifecycle.unmount(); h.render();
        assert.equal(h.hook.isUpdatingInsights, true); assert.equal(h.hook.isInsightsLocked, true);
        h.hook.requestUpdateInsights(); await flush(); assert.equal(h.scrapes.length, 1);
        if (stage === 'PATCH') { h.scrapes[0].resolve(); await flush(); }
        h.gets[0].resolve(refreshedInsights(h)); await flush(); h.render();
        assert.equal(h.hook.isInsightsLocked, false);
        assertFullInsightsSnapshot(h, refreshedInsights(h));
    }
});

test('Insights: stale ordinary GET cannot overwrite refreshed query cache', async () => {
    const h = createInsightsHarness(); let resolveOld, resolveDuring;
    const old = h.queryClient.fetchQuery({ queryKey: h.cacheKey, queryFn: () => new Promise(resolve => { resolveOld = resolve; }) }).catch(() => {});
    h.hook.requestUpdateInsights(); await flush(); h.scrapes[0].resolve(); await flush();
    const during = h.queryClient.fetchQuery({ queryKey: h.cacheKey, queryFn: () => new Promise(resolve => { resolveDuring = resolve; }) }).catch(() => {});
    const refreshed = refreshedInsights(h); h.gets[0].resolve(refreshed); await flush();
    resolveOld(h.input.campaign); resolveDuring(h.input.campaign); await Promise.all([old, during]);
    assert.deepEqual(h.queryClient.getQueryData(h.cacheKey), refreshed);
});

test('Insights: a GET response for another campaign is rejected and can be retried with GET only', async () => {
    const h = createInsightsHarness(); h.hook.requestUpdateInsights(); await flush();
    const before = h.store.getState();
    const wrong = { ...refreshedInsights(h), campaignId: 'wrong-campaign' };
    await finishInsights(h, wrong);
    assert.equal(h.store.getState(), before);
    assert.notDeepEqual(h.queryClient.getQueryData(h.cacheKey), wrong);
    assert.equal(h.hook.needsInsightsRefresh, true); assert.equal(h.hook.isInsightsLocked, true);
    h.hook.retryInsightsRefresh(); await flush();
    const refreshed = refreshedInsights(h);
    h.gets[1].resolve(refreshed); await flush(); h.render();
    assert.equal(h.scrapes.length, 1); assertFullInsightsSnapshot(h, refreshed);
});

test('Insights: failure to accept a full snapshot keeps editing locked until GET-only recovery succeeds', async () => {
    const h = createInsightsHarness(), apply = h.store.getState().applySavedCampaign;
    const refreshed = refreshedInsights(h);
    h.store.setState({ applySavedCampaign: () => { throw new Error('Snapshot acceptance failed'); } });
    const before = h.store.getState();
    h.hook.requestUpdateInsights(); await flush(); await finishInsights(h, refreshed);
    assert.equal(h.store.getState(), before);
    assert.equal(h.hook.needsInsightsRefresh, true); assert.equal(h.hook.isInsightsLocked, true);
    attemptCampaignEdits(h.hook); assert.equal(h.store.getState(), before);
    h.store.setState({ applySavedCampaign: apply });
    h.hook.retryInsightsRefresh(); await flush();
    h.gets[1].resolve(refreshed); await flush(); h.render();
    assert.equal(h.scrapes.length, 1); assert.equal(h.saves.length, 0);
    assert.equal(h.hook.isInsightsLocked, false); assertFullInsightsSnapshot(h, refreshed);
});

test('Insights: an already rendered Paid button checks the live lock before sending', async () => {
    const h = createInsightsHarness(), paid = [];
    const { MarkPromoAsPaid } = loadUI('src/features/campaign-management/mark-promo-as-paid/ui/mark-promo-as-paid.tsx', {}, {
        '@tanstack/react-query': {
            useQueryClient: () => h.queryClient, useIsMutating: () => 0,
            useMutation: () => ({ mutate: params => paid.push(params) }),
        },
    });
    const tree = MarkPromoAsPaid({
        campaignId: h.input.params.campaignId, promoId: 'placement-a', closePromo: 'wait',
        canMarkAsPaid: true, isActionBlocked: h.hook.isInsightsActionBlocked, onPaid() {},
    });
    h.hook.requestUpdateInsights();
    child(tree, 'button').props.onClick(); assert.equal(paid.length, 0);
    await flush(); await finishInsights(h);
    child(tree, 'button').props.onClick(); assert.equal(paid.length, 0);
    const fresh = MarkPromoAsPaid({
        campaignId: h.input.params.campaignId, promoId: 'placement-a', closePromo: 'wait',
        canMarkAsPaid: true, isActionBlocked: h.hook.isInsightsActionBlocked, onPaid() {},
    });
    child(fresh, 'button').props.onClick(); assert.equal(paid.length, 1);
});

test('Insights: Page keeps Reset/Save and Update Insights visible, forwards lock props, retains tabs and share copy', async () => {
    const h = createInsightsHarness(); h.hook.requestUpdateInsights(); await flush(); h.render();
    const { CampaignManagementPage } = loadUI('src/pages/campaign-management-v2/ui/campaign-management-page.tsx', {
        useState: value => [value, () => {}], useRef: value => ({ current: value }),
    }, { '@/pages/campaign-management-v2/model/use-campaign-management-state.ts': { useCampaignManagementState: () => h.hook } });
    const page = CampaignManagementPage();
    const header = child(page, 'CampaignHeader').props, navigation = child(page, 'CampaignNavigation').props;
    assert.equal(header.readOnly, false); assert.equal(header.isSaveDisabled, true); assert.equal(header.isResetDisabled, true);
    assert.equal(header.isEditingDisabled, true);
    assert.equal(navigation.canUpdateInsights, true); assert.equal(navigation.isUpdatingInsights, true);
    assert.equal(child(page, 'CampaignMetrics').props.isBudgetDisabled, true);
    assert.equal(child(page, 'CampaignWorkspace').props.isInsightsLocked, true);
    assert.equal(typeof child(page, 'CampaignToolbar').props.onValueChange, 'function');
    const { CampaignNavigation } = loadUI('src/widgets/campaign-management-v2/campaign-navigation/ui/campaign-navigation.tsx', {
        useState: value => [value, () => {}], useRef: value => ({ current: value }), useEffect() {},
    }, { '@/shared/hooks/use-copy-to-clipboard': { useCopyToClipboard: () => async () => true } });
    const nav = CampaignNavigation({ ...navigation, shareLink: 'https://example.test/share' });
    assert.equal(elements(nav, node => node.type === 'Spinner').length, 1);
    assert.equal(elements(nav, node => node.type === 'button')[1].props.disabled, false);
    const { CampaignWorkspace } = loadUI(workspaceFile, { useState: () => ['placement-a', () => {}] });
    const workspace = CampaignWorkspace({ ...child(page, 'CampaignWorkspace').props, view: 'strategy' });
    assert.equal(child(workspace, 'CampaignAccountHeader').props.readOnly, false);
    assert.equal(child(workspace, 'CampaignAccountHeader').props.isRemoveDisabled, true);
    assert.equal(child(workspace, 'CampaignAccountEditor').props.readOnly, false);
    assert.equal(child(workspace, 'CampaignAccountEditor').props.disabled, true);
    const insights = CampaignWorkspace({ ...child(page, 'CampaignWorkspace').props, view: 'insights' });
    assert.equal(child(insights, 'CampaignAccountsTable').props.canRemoveAccount, false);
    h.scrapes[0].resolve(); await flush();
    h.gets[0].reject(new Error('GET failed')); await flush(); h.render();
    const recoveryPage = CampaignManagementPage();
    const alert = elements(recoveryPage, node => node.props.role === 'alert')[0];
    assert.deepEqual(elements(alert, node => node.type === 'p').map(node => node.props.children), [
        'Could not refresh campaign data',
        'Processing has finished, but the latest campaign data could not be loaded. Editing is temporarily disabled. Retry to load the latest data.',
    ]);
    const order = elements(recoveryPage, node => node.type === 'CampaignNavigation' || node === alert || node.type === 'CampaignHeader');
    assert.deepEqual(order.map(node => node.type), ['CampaignNavigation', 'div', 'CampaignHeader']);
    const retry = child(alert, 'button');
    assert.equal(retry.props.children.at(-1), 'Retry data refresh');
    assert.equal(retry.props.disabled, false); assert.equal(child(alert, 'Spinner'), undefined);
    assert.equal(child(recoveryPage, 'CampaignWorkspace').props.isInsightsLocked, true);
    assert.equal(child(recoveryPage, 'CampaignHeader').props.readOnly, false);
    retry.props.onClick(); await flush(); h.render();
    const refreshing = elements(CampaignManagementPage(), node => node.props.role === 'alert')[0];
    assert.equal(child(refreshing, 'button').props.disabled, true);
    assert.equal(child(refreshing, 'button').props['aria-busy'], true);
    assert.equal(child(refreshing, 'button').props.children.at(-1), 'Refreshing…');
    assert.equal(child(refreshing, 'Spinner').props.size, 16);
    assert.equal(elements(refreshing, node => node.props.role === 'status')[0].props['aria-label'], 'Refreshing campaign data');
    assert.equal(h.scrapes.length, 1); assert.equal(h.gets.length, 2);
    await finishInsights(h);
});

test('Insights: a previously edited name cannot commit on delayed blur during or after refresh', async () => {
    const h = createInsightsHarness(), lifecycle = createHookLifecycle();
    const { CampaignHeader } = loadUI('src/widgets/campaign-management-v2/campaign-header/ui/campaign-header.tsx', lifecycle.react, {
        '@/entities/campaign/model/campaign-details.types.ts': { CAMPAIGN_STATUS_LABELS: { distributing: 'Distributing' } },
        '@/shared/constants/currency-taxonomy.ts': { CURRENCY_LABELS: { EUR: 'EUR' } },
    });
    const render = () => lifecycle.render(() => CampaignHeader({
        campaignName: h.store.getState().draft.campaign.campaignName,
        campaignStatus: 'distributing', currency: 'EUR', internalCost: 0,
        onCampaignNameChange: h.hook.updateCampaignName, onSave: h.hook.saveCampaign, onReset: h.hook.resetDraft,
        readOnly: h.hook.isReadOnly, isEditingDisabled: h.hook.isInsightsLocked,
        isSaveDisabled: !h.hook.canSave, isResetDisabled: !h.hook.canReset,
    }));
    let tree = render(); child(tree, 'input').props.onChange({ target: { value: 'Uncommitted name' } });
    tree = render(); const lateBlur = child(tree, 'input').props.onBlur;
    h.hook.requestUpdateInsights(); await flush(); h.render();
    const before = h.store.getState(); lateBlur(); assert.equal(h.store.getState(), before);
    tree = render(); assert.equal(child(tree, 'input').props.readOnly, true);
    assert.equal(elements(tree, e => e.type === 'button').length, 2);
    assert.ok(elements(tree, e => e.type === 'button').every(e => e.props.disabled));
    await finishInsights(h); const accepted = h.store.getState(); lateBlur();
    assert.equal(h.store.getState(), accepted);
    tree = render(); assert.equal(child(tree, 'input').props.readOnly, false);
    assert.equal(child(tree, 'input').props.value, accepted.draft.campaign.campaignName);
});

test('Insights: open description Apply stays visible but disabled; its old callback cannot restore stale text', async () => {
    const h = createInsightsHarness(), lifecycle = createHookLifecycle();
    const { CampaignTextEditor } = loadUI(workspaceRoot + 'campaign-account-editor/campaign-text-editor/campaign-text-editor.tsx', {
        ...lifecycle.react, useId: () => 'description-id',
    }, { '@radix-ui/react-popover': Object.fromEntries(['Root', 'Anchor', 'Trigger', 'Portal', 'Content', 'Close'].map(name => [name, `Popover.${name}`])) });
    const render = () => {
        const update = h.hook.onUpdateDescriptionForAccount;
        return lifecycle.render(() => CampaignTextEditor({
        readOnly: false, disabled: h.hook.isInsightsLocked, label: 'Description', placeholder: 'description',
        options: [{ id: 'content-a-d1', text: h.store.getState().draft.campaign.campaignContent[0].descriptions[0].description }],
        selectedId: 'content-a-d1', onSelect() {}, onCreate() {}, onDelete() {},
        onUpdate: (id, text) => update('content-a', id, text),
        }));
    };
    // Capture the actual page callback, rather than dynamically looking up a new one on Apply.
    const originalUpdate = h.hook.onUpdateDescriptionForAccount;
    let tree = render(); child(tree, 'textarea').props.onChange({ target: { value: 'Uncommitted text' } });
    tree = render();
    const staleApply = elements(tree, e => e.type === 'button' && e.props.children === 'Apply')[0].props.onClick;
    h.hook.requestUpdateInsights(); await flush(); h.render();
    tree = render(); assert.equal(child(tree, 'textarea').props.readOnly, true);
    const apply = elements(tree, e => e.type === 'button' && e.props.children === 'Apply')[0];
    assert.equal(apply.props.disabled, true);
    const before = h.store.getState(); apply.props.onClick(); originalUpdate('content-a', 'content-a-d1', 'Late text');
    assert.equal(h.store.getState(), before);
    await finishInsights(h); const accepted = h.store.getState();
    originalUpdate('content-a', 'content-a-d1', 'Late text');
    // Old editor callbacks must also stay protected after a successful server replacement.
    staleApply();
    assert.equal(h.store.getState(), accepted);
});

test('Insights: open post/screenshot forms reject late Apply and disable upload changes', async () => {
    const h = createInsightsHarness();
    const { EditPostLink } = loadUI('src/features/campaign-management/edit-post-link/ui/edit-post-link.tsx', initialReact);
    const { EditScreenshot } = loadUI('src/features/campaign-management/edit-screenshot/ui/edit-screenshot.tsx', {
        useState: () => [true, () => {}],
    });
    const onPostLink = h.hook.setAccountPostLink;
    const beforeLink = EditPostLink({ value: '', onApply: value => onPostLink('placement-a', value) });
    const onScreenshot = h.hook.setAccountScreenshot;
    const beforeShot = EditScreenshot({ value: '', onApply: value => onScreenshot('placement-a', value) });
    h.hook.requestUpdateInsights(); await flush(); h.render();
    const blockedLink = EditPostLink({ value: '', disabled: true, onApply: () => assert.fail('disabled Apply') });
    child(blockedLink, 'EditPostLinkForm').props.onApply('https://example.test/late');
    assert.equal(child(blockedLink, 'EditPostLinkForm').props.disabled, true);
    const { ScreenshotEditor } = loadUI('src/features/campaign-management/edit-screenshot/ui/screenshot-editor.tsx', {
        useRef: () => ({ current: null }),
    }, { '../model/use-screenshot-editor': { useScreenshotEditor: () => ({
        screenshotUrl: 'https://example.test/uploaded', canApply: true,
        uploadFile: () => assert.fail('disabled upload'), removeScreenshot: () => assert.fail('disabled remove'),
    }) } });
    const shot = ScreenshotEditor({ disabled: true, onApply: () => assert.fail('disabled screenshot Apply') });
    assert.equal(child(shot, 'input').props.disabled, true);
    assert.equal(child(shot, 'ScreenshotPreview').props.isRemoveDisabled, true);
    child(shot, 'ScreenshotPreview').props.onRemoveScreenshot();
    child(shot, 'input').props.onChange({ currentTarget: { files: [{}], value: '' } });
    const apply = elements(shot, e => e.type === 'button' && e.props.children === 'Apply')[0];
    assert.equal(apply.props.disabled, true); apply.props.onClick();
    const before = h.store.getState();
    child(beforeLink, 'EditPostLinkForm').props.onApply('https://example.test/late');
    child(beforeShot, 'ScreenshotEditor').props.onApply('https://example.test/uploaded');
    assert.equal(h.store.getState(), before);
    await finishInsights(h); const accepted = h.store.getState();
    child(beforeLink, 'EditPostLinkForm').props.onApply('https://example.test/late');
    child(beforeShot, 'ScreenshotEditor').props.onApply('https://example.test/uploaded');
    assert.equal(h.store.getState(), accepted);
    assert.equal(child(beforeLink, 'EditPostLinkForm').props.disabled, false);
});
