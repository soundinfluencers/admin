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
        './use-campaign-menu-actions': { useCampaignMenuActions: () => ({
            isMenuBusy: false, isMenuActionBlocked: () => false,
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
    const dependencies = { 'react/jsx-runtime': jsx, react, clsx: require('clsx') };
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

function createWhatsAppHarness(status = 'distributing') {
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
    const h = { store, input, lifecycle, queryClient, context: input.params, posts: [], saves: [], gets: [], notifications: [] };
    const defer = (calls, args) => new Promise((resolve, reject) => calls.push({ args, resolve, reject }));
    // Execute real Query mutations, including their pending lock and retry policy, without HTTP.
    const query = {
        useQueryClient: () => queryClient,
        useIsMutating: filters => queryClient.isMutating(filters),
        useMutation: options => ({
            mutateAsync: variables => queryClient.getMutationCache().build(queryClient, options).execute(variables),
            isPending: queryClient.isMutating({ mutationKey: options.mutationKey }) > 0,
        }),
    };
    const api = {
        sendCampaignWhatsAppOne: request => defer(h.posts, request),
        updateCampaignById: request => defer(h.saves, request),
        getCampaignById: params => defer(h.gets, params),
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

test('row preview groups duplicate placements by influencer; opening and copying never send', async () => {
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
    const { CampaignMessagePreviewModal } = loadUI(whatsAppRoot + 'ui/campaign-message-preview-modal.tsx', initialReact, {
        clsx: { default: require('clsx') },
        '@/shared/hooks/use-copy-to-clipboard': { useCopyToClipboard: () => async text => { copied.push(text); return true; } },
        '../model/campaign-whatsapp-message': loadWhatsAppMessage(),
    });
    const modal = CampaignMessagePreviewModal({ preview, isSending: false, onSendWhatsApp: h.hook.sendMessagePreview });
    const buttons = elements(modal, n => n.type === 'button');
    buttons[0].props.onClick(); await flush();
    assert.deepEqual(copied, [preview.request.message]);
    assert.equal(buttons[1].props.disabled, true); assert.equal(buttons[2].props.disabled, true);
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
function createProposalHarness(store = initialized('proposal').store) {
    const lifecycle = createHookLifecycle();
    const saves = [], copies = [], navigations = [], queries = [], notifications = [], invalidations = [];
    const defer = (calls, args) => new Promise((resolve, reject) => calls.push({ args, resolve, reject }));
    const h = {
        store, lifecycle, saves, copies, navigations, queries, notifications, invalidations,
        context: { campaignId: 'synthetic-campaign', status: 'proposal', optionIndex: 0, view: 'strategy' },
        query: {}, navigationError: null, optimisticNavigation: false, invalidationError: null,
    };
    const queryClient = {
        async cancelQueries() {}, setQueryData() {},
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
        h.saves[0].resolve(saved); await flush();
        assert.equal(h.copies[0].args.body.campaignName, 'Saved response');
        h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 7 });
        await assert.doesNotReject(saving);
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

test('View changes preserve Save and continue; failed creation does not roll back the saved baseline', async () => {
    const h = createProposalHarness(); h.confirmCopy();
    const saving = h.hook.saveAndContinueProposalAction();
    h.context.view = 'audience'; h.render();
    h.saves[0].resolve({ ...fixture('proposal').campaign, campaignName: 'Confirmed name' }); await flush();
    assert.equal(h.copies.length, 1);
    h.copies[0].reject(new Error('POST failed')); await saving;
    assert.equal(h.store.getState().baseline.campaign.campaignName, 'Confirmed name');
    assert.equal(loadComparison().selectCampaignIsDirty(h.store.getState()), false);
    assert.equal(h.notifications[0].message, 'POST failed'); assert.deepEqual(h.navigations, []);
});

test('failed Save stops continuation; Cancel preserves draft; Discard copies baseline', async () => {
    const h = createProposalHarness(); h.confirmCopy();
    const saving = h.hook.saveAndContinueProposalAction();
    h.saves[0].reject(new Error('PATCH failed')); await saving; h.render();
    assert.equal(h.copies.length, 0); assert.equal(h.hook.isUnsavedChangesModalOpen, true);
    h.hook.cancelProposalAction(); h.render();
    assert.equal(h.hook.isCreateOptionModalOpen, true);
    assert.equal(h.store.getState().draft.campaign.campaignName, 'Unsaved name');
    h.hook.createProposalCopy(); h.render(); h.hook.discardAndContinueProposalAction();
    assert.equal(h.copies[0].args.body.campaignName, 'Synthetic campaign');
    h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 1 }); await flush();
});

test('Save then Copy uses PATCH response and server option index before initializing from a full GET', async () => {
    const h = createProposalHarness(); h.confirmCopy();
    const saving = h.hook.saveAndContinueProposalAction(); h.render();
    assert.equal(h.hook.isSaving, true); assert.equal(h.hook.isPending, false);
    assert.equal(h.hook.data.campaignName, 'Unsaved name'); assert.equal(h.copies.length, 0);
    const saved = { ...fixture('proposal').campaign, campaignName: 'PATCH response' };
    h.saves[0].resolve(saved); await flush();
    assert.equal(h.copies.length, 1); assert.equal(h.copies[0].args.body.campaignName, 'PATCH response');
    assert.equal(h.store.getState().baseline.campaign.campaignName, 'PATCH response');
    h.copies[0].resolve({ campaignId: 'synthetic-campaign', optionIndex: 8 }); await saving; h.render();
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
    assert.equal(h.hook.canSave, true); assert.equal(h.hook.isReadOnly, false);
    assert.equal(h.hook.canMarkAsPaid, false); assert.equal(h.hook.isDirty, false);
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
