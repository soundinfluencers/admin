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
        compilerOptions: {
            module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
            jsx: ts.JsxEmit.ReactJSX,
        },
    }).outputText;
    const exports = {};
    vm.runInNewContext(code, {
        exports, structuredClone, console: { log() {}, error: console.error }, ...globals,
        require(id) {
            if (Object.hasOwn(dependencies, id)) return dependencies[id];
            throw new Error(`Unexpected dependency: ${id}`);
        },
    }, { filename: file });
    return exports;
}

function createStore() {
    const memory = new Map();
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
        '@/entities/campaign/model/campaign-price.ts': price,
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
        ['setAccountDateRequest', 'ASAP'], ['setAccountPostLink', ' '],
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
    const { useCampaignManagementState } = loadSource('src/pages/campaign-management-v2/model/use-campaign-management-state.ts', {
        react: { useMemo: fn => fn(), useCallback: fn => fn, useEffect() {} },
        'react-router-dom': { useParams: () => ({ campaignId: 'synthetic-campaign', status }) },
        '@tanstack/react-query': { useQueryClient: () => queryClient },
        nuqs: {
            parseAsInteger: { withDefault: value => value },
            parseAsStringLiteral: () => ({ withDefault: value => value }),
            useQueryState: (_, value) => [value, () => {}],
        },
        '@/entities/campaign/api/use-campaigns-query.ts': { useCampaignDetailsQuery: () => ({}) },
        '@/entities/campaign/api/campaign.query-keys.ts': { campaignsQueryKeys: { details: () => ['details'] } },
        '../store/campaign-management.store.ts': { useCampaignManagementStore: selector => selector(store.getState()) },
        '../store/campaign-management.selectors.ts': { selectCurrentFollowers },
        './url-path-helpers.ts': { isCampaignStatus: value => ['distributing', 'completed', 'under_review', 'proposal'].includes(value) },
        '@/shared/constants/campaign-view.ts': { CAMPAIGN_VIEWS: ['strategy', 'audience', 'insights'] },
    });
    return useCampaignManagementState();
}

test('hook → page → Workspace → editor/table forwards placement ID into the store', () => {
    const { store } = initialized();
    const state = loadPageHook(store);
    const { CampaignManagementPage } = loadUI('src/pages/campaign-management-v2/ui/campaign-management-page.tsx', {}, {
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
