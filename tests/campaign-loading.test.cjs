const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const flush = () => new Promise(resolve => setImmediate(resolve));

function loadSource(file, dependencies) {
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(code, {
        exports, structuredClone, crypto: require('node:crypto').webcrypto,
        console: { log() {}, error() {} },
        require(id) {
            if (id in dependencies) return dependencies[id];
            throw new Error(`Unexpected dependency: ${id}`);
        },
    }, { filename: file });
    return exports;
}

// Execute the real hook and store with a minimal effect lifecycle harness.
// React rendering and HTTP are simulated; the request and dirty guards are not.
function createHarness() {
    const helpers = loadSource('src/entities/campaign-managment/model/campaign-management.helpers.ts', {
        '@/entities/campaign-managment/api/campaign-controls.api.ts': {}, 'react-toastify': {},
    });
    const storeModule = loadSource('src/entities/campaign-managment/store/campaign-management.store.ts', {
        zustand: require('zustand'),
        '@/entities/campaign-managment/model/campaign-management.helpers.ts': helpers,
    });
    const store = storeModule.useCampaignManagementStore;
    const gets = [], saves = [];
    const defer = (calls, args) => new Promise((resolve, reject) => calls.push({ args, resolve, reject }));
    let slots = [], cursor = 0, result;
    const layouts = [], effects = [];
    const changed = (a, b) => !a || a.length !== b.length || a.some((value, i) => !Object.is(value, b[i]));
    const effect = queue => (callback, deps) => {
        const index = cursor++, previous = slots[index];
        if (changed(previous?.deps, deps)) {
            slots[index] = { deps, cleanup: previous?.cleanup };
            queue.push(() => {
                slots[index].cleanup?.();
                slots[index].cleanup = callback();
            });
        }
    };
    const react = {
        useRef(value) { const index = cursor++; return slots[index] ??= { current: value }; },
        useState(value) {
            const index = cursor++; slots[index] ??= { value };
            return [slots[index].value, next => {
                slots[index].value = typeof next === 'function' ? next(slots[index].value) : next;
            }];
        },
        useCallback(callback, deps) {
            const index = cursor++;
            if (changed(slots[index]?.deps, deps)) slots[index] = { deps, callback };
            return slots[index].callback;
        },
        useLayoutEffect: effect(layouts), useEffect: effect(effects),
    };
    const { useCampaignLoading } = loadSource('src/pages/campaign-managment/model/use-campaign-loading.ts', {
        react,
        '@/entities/campaign-managment/api/fetch-status-campaign': { getCampaignByStatus: args => defer(gets, args) },
        '@/entities/campaign-managment/api/update-campaign': { updateCampaignByStatus: args => defer(saves, args) },
        '@/entities/campaign-managment/store/campaign-management.store': storeModule,
    });
    let props = ['campaign', 'pending', 0];
    const render = (next = props) => {
        props = next; cursor = 0; result = useCampaignLoading(...props);
        layouts.splice(0).forEach(run => run()); effects.splice(0).forEach(run => run());
        return result;
    };
    const unmount = () => { slots.forEach(slot => slot.cleanup?.()); slots = []; };
    return { store, gets, saves, render, unmount, get hook() { return result; } };
}

function campaign(id = 'campaign', count = 1) {
    return {
        campaignId: id, campaignName: 'Campaign', status: 'pending', displayCurrency: 'EUR',
        canEdit: true, campaignContent: [],
        addedAccounts: ['first', 'second'].map((addedAccountsId, index) => ({
            addedAccountsId, socialAccountId: addedAccountsId, influencerId: 'influencer',
            socialMedia: 'instagram', username: addedAccountsId,
            postLink: index < count ? `https://example.test/post/${index + 1}` : '',
        })),
    };
}
const links = h => h.store.getState().editable.addedAccounts.filter(account => account.postLink).length;

// Run the actual UI handler without rendering the rest of the legacy page.
function loadHandler(file, name, globals) {
    const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'),
        ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let initializer;
    const visit = node => {
        if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) initializer = node.initializer;
        ts.forEachChild(node, visit);
    };
    visit(source);
    assert.ok(initializer, `Handler ${name} exists`);
    const code = ts.transpileModule(`exports.handler = ${initializer.getText(source)};`, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(code, { exports, console: { log() {}, error() {} }, URLSearchParams, ...globals });
    return exports.handler;
}

const pageFile = 'src/pages/campaign-managment/ui/campaign-managment.tsx';
function pageGlobals(h, status = 'pending', optionIndex = 0) {
    return {
        campaignId: 'campaign', status, statusParam: status, optionIndex,
        editable: h.store.getState().editable, activeOptionIndex: h.store.getState().activeOptionIndex,
        buildSavePayload: () => h.store.getState().buildSavePayload(),
        saveCampaign: h.hook.saveCampaign, loadCampaignByOption: h.hook.loadCampaignByOption,
        searchParams: new URLSearchParams({ id: 'campaign', status, optionIndex: String(optionIndex) }),
        setIsSaving() {}, useCallback: callback => callback,
    };
}

test('reopening a clean campaign fetches new post links without a fetch loop', async () => {
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 0);
    h.render(); assert.equal(h.gets.length, 1);
    h.gets[0].resolve(campaign()); await flush(); h.render(); assert.equal(h.gets.length, 1);
    h.unmount(); h.render(); assert.equal(h.gets.length, 2);
    h.gets[1].resolve(campaign('campaign', 2)); await flush(); h.render(); h.render();
    assert.equal(links(h), 2); assert.equal(h.gets.length, 2);
});

test('return from Add accounts preserves attached accounts and unsaved edits; Reset does not fetch', () => {
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 0);
    h.store.getState().setAccountInsightField('second', 'postLink', 'https://example.test/draft');
    h.store.getState().addAccounts([{
        addedAccountsId: 'attached', socialAccountId: 'attached', influencerId: 'i',
        socialMedia: 'instagram', username: 'attached', selectedCampaignContentItem: null, dateRequest: 'ASAP',
    }]);
    const draft = h.store.getState().editable;
    h.render(); h.render(); assert.equal(h.gets.length, 0);
    assert.equal(h.store.getState().editable, draft); assert.equal(draft.addedAccounts.length, 3);
    h.store.getState().resetEditableToOriginal(); h.render();
    assert.equal(h.gets.length, 0); assert.equal(links(h), 1);
});

test('local edits during GET survive its response', async () => {
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 0); h.render();
    h.store.getState().setCampaignName('Unsaved name');
    h.gets[0].resolve(campaign('campaign', 2)); await flush(); h.render();
    assert.equal(h.store.getState().editable.campaignName, 'Unsaved name');
    assert.equal(links(h), 1); assert.equal(h.gets.length, 1); assert.equal(h.hook.isCampaignLoading, false);
});

test('a dirty under_review campaign continues on its pending route', () => {
    const h = createHarness();
    h.store.getState().initCampaign({ ...campaign(), status: 'under_review' }, 0);
    h.store.getState().setCampaignName('Review draft'); h.render();
    assert.equal(h.gets.length, 0);
    assert.equal(h.store.getState().editable.campaignName, 'Review draft');
});

test('late GET from a previous campaign cannot replace the current campaign', async () => {
    const h = createHarness(); h.render(); h.render(['other', 'pending', 0]);
    h.gets[1].resolve(campaign('other', 2)); await flush();
    h.gets[0].resolve(campaign()); await flush(); h.render();
    assert.equal(h.store.getState().editable.campaignId, 'other'); assert.equal(links(h), 2);
    assert.equal(h.gets.length, 2);
});

test('late GET from a previous option cannot replace the current option', async () => {
    const h = createHarness(); h.render(); h.render(['campaign', 'pending', 1]);
    h.gets[1].resolve(campaign('campaign', 2)); await flush();
    h.gets[0].resolve(campaign()); await flush();
    assert.equal(h.store.getState().activeOptionIndex, 1); assert.equal(links(h), 2);
});

test('newer GET wins over an older GET in the same campaign', async () => {
    const h = createHarness(); h.render(); const reload = h.hook.loadCampaignByOption(0);
    h.gets[1].resolve(campaign('campaign', 2)); await reload;
    h.gets[0].resolve(campaign()); await flush(); assert.equal(links(h), 2);
});

test('Save invalidates earlier GETs and suppresses GETs while saving', async () => {
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 0); h.render();
    h.store.getState().setAccountInsightField('second', 'postLink', 'https://example.test/post/2');
    const saving = h.hook.saveCampaign(h.store.getState().buildSavePayload(), 'pending');
    await h.hook.loadCampaignByOption(0); assert.equal(h.gets.length, 1);
    h.saves[0].resolve(campaign('campaign', 2)); await saving;
    h.gets[0].resolve(campaign()); await flush(); h.render(); assert.equal(links(h), 2);
    assert.equal(JSON.stringify(h.store.getState().editable), JSON.stringify(h.store.getState().original));
    assert.equal(h.gets.length, 1);
});

test('edits after Save starts survive; Reset uses the confirmed saved snapshot', async () => {
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 0);
    h.store.getState().setAccountInsightField('second', 'postLink', 'https://example.test/post/2'); h.render();
    const saving = h.hook.saveCampaign(h.store.getState().buildSavePayload(), 'pending');
    h.store.getState().setCampaignName('Edited while saving');
    h.saves[0].resolve(campaign('campaign', 2)); await saving; h.render();
    assert.equal(h.store.getState().editable.campaignName, 'Edited while saving');
    assert.equal(h.store.getState().original.campaignName, 'Campaign'); assert.equal(links(h), 2);
    h.store.getState().resetEditableToOriginal();
    assert.equal(h.store.getState().editable.campaignName, 'Campaign'); assert.equal(links(h), 2);
    assert.equal(h.gets.length, 0);
});

test('Save response after navigation cannot replace another campaign', async () => {
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 0);
    h.store.getState().setCampaignName('Draft'); h.render();
    const saving = h.hook.saveCampaign(h.store.getState().buildSavePayload(), 'pending');
    h.render(['other', 'pending', 0]); h.gets[0].resolve(campaign('other', 2)); await flush();
    h.saves[0].resolve(campaign()); await saving;
    assert.equal(h.store.getState().editable.campaignId, 'other');
});

test('unmount invalidates GET even when the same route is subsequently mounted', async () => {
    const h = createHarness(); h.render(); h.unmount(); h.render();
    h.gets[1].resolve(campaign('campaign', 2)); await flush();
    h.gets[0].resolve(campaign()); await flush(); assert.equal(links(h), 2);
});

test('failed GET ends loading without a retry loop; explicit reload recovers', async () => {
    const h = createHarness(); h.render(); h.gets[0].reject(new Error('Network unavailable'));
    await flush(); h.render(); assert.equal(h.hook.isCampaignLoading, false); assert.equal(h.gets.length, 1);
    const reload = h.hook.loadCampaignByOption(0); h.gets[1].resolve(campaign()); await reload;
    assert.equal(links(h), 1);
});

test('callback targeting another option cannot start an out-of-context GET', async () => {
    const h = createHarness(); h.render(); await h.hook.loadCampaignByOption(1);
    assert.equal(h.gets.length, 1);
});

test('skipped Save reports skipped and handleSave does not show success or send PATCH', async () => {
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 0);
    h.store.getState().setCampaignName('Draft'); h.render();
    const staleSave = h.hook.saveCampaign;
    const globals = pageGlobals(h), successes = [];
    h.render(['other', 'pending', 0]);
    const skipped = await staleSave(h.store.getState().buildSavePayload(), 'pending');
    assert.equal(skipped.kind, 'skipped'); assert.equal(h.saves.length, 0);
    const handler = loadHandler(pageFile, 'handleSave', {
        ...globals, toast: { success: message => successes.push(message) },
    });
    await handler();
    assert.equal(successes.length, 0); assert.equal(h.saves.length, 0);
});

test('duplicate Save has no success; successful PATCH without body has success; rejected PATCH does not', async () => {
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 0);
    h.store.getState().setCampaignName('Draft'); h.render();
    const successes = [];
    const handler = loadHandler(pageFile, 'handleSave', {
        ...pageGlobals(h), toast: { success: message => successes.push(message) },
    });
    const first = handler(); await handler();
    assert.equal(h.saves.length, 1); assert.equal(successes.length, 0);
    h.saves[0].resolve(undefined); await first;
    assert.equal(successes.length, 1);
    const failed = handler(); h.saves[1].reject(new Error('PATCH failed')); await failed;
    assert.equal(successes.length, 1);
});

test('successful PATCH with empty HTTP body remains a completed Save', async () => {
    for (const data of [null, undefined, '']) {
        const api = loadSource('src/entities/campaign-managment/api/update-campaign.ts', {
            '@/app/api/http.ts': { $api: { patch: async () => ({ data }) } },
        });
        assert.equal(await api.updateCampaignByStatus({ campaignId: 'campaign', status: 'pending', body: {} }), undefined);
    }
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 0);
    h.store.getState().setCampaignName('Draft'); h.render();
    const saving = h.hook.saveCampaign(h.store.getState().buildSavePayload(), 'pending');
    h.saves[0].resolve(undefined);
    assert.equal((await saving).kind, 'saved');
});

test('reloadCampaignFromScratch changes URL and its committed status starts GET', async () => {
    for (const [from, to] of [['distributing', 'completed'], ['completed', 'distributing']]) {
        const h = createHarness(); h.store.getState().initCampaign({ ...campaign(), status: from }, 2);
        h.store.getState().setCampaignName('Draft'); h.render(['campaign', from, 2]);
        let nextParams;
        const reload = loadHandler(pageFile, 'reloadCampaignFromScratch', {
            ...pageGlobals(h, from, 2), setSearchParams: params => { nextParams = params; },
        });
        await reload(to); assert.equal(nextParams.get('view'), '-1');
        h.render(['campaign', nextParams.get('status'), Number(nextParams.get('optionIndex'))]);
        assert.equal(h.gets.length, 1); assert.equal(h.gets[0].args.status, to);
        assert.equal(h.gets[0].args.optionIndex, 0);
        h.gets[0].resolve({ ...campaign('campaign', 2), status: to }); await flush(); h.render();
        assert.equal(h.store.getState().status, to); assert.equal(h.gets.length, 1);
    }
});

test('proposal option switch starts GET after URL commit despite an existing draft', async () => {
    const h = createHarness(); h.store.getState().initCampaign({ ...campaign(), status: 'proposal' }, 0);
    h.store.getState().setCampaignName('Draft'); h.render(['campaign', 'proposal', 0]);
    let nextParams;
    const change = loadHandler(pageFile, 'handleOptionChange', {
        ...pageGlobals(h, 'proposal'), setSearchParams: params => { nextParams = params; },
    });
    change(1); h.render(['campaign', nextParams.get('status'), Number(nextParams.get('optionIndex'))]);
    assert.equal(h.gets.length, 1); assert.equal(h.gets[0].args.optionIndex, 1);
    h.gets[0].resolve({ ...campaign(), status: 'proposal' }); await flush(); h.render();
    assert.equal(h.store.getState().activeOptionIndex, 1); assert.equal(h.gets.length, 1);
});

test('adding proposal option loads the new option after URL commit', async () => {
    const h = createHarness(); h.store.getState().initCampaign({ ...campaign(), status: 'proposal' }, 0);
    h.store.getState().setCampaignName('Draft'); h.render(['campaign', 'proposal', 0]);
    let nextParams, additions = 0;
    const add = loadHandler(pageFile, 'handleAddOption', {
        ...pageGlobals(h, 'proposal'), existingOptions: [0, 1], getCampaignBudget: () => 0,
        setOptionModal() {}, toast: { success() {} },
        addAdminProposalOption: async () => { additions++; },
        setSearchParams: params => { nextParams = params; },
    });
    await add(false); assert.equal(additions, 1); assert.equal(h.gets.length, 0);
    h.render(['campaign', nextParams.get('status'), Number(nextParams.get('optionIndex'))]);
    assert.equal(h.gets.length, 1); assert.equal(h.gets[0].args.optionIndex, 2);
    h.gets[0].resolve({ ...campaign(), status: 'proposal' }); await flush();
    assert.equal(h.store.getState().activeOptionIndex, 2);
});

test('deleting proposal option reloads an unchanged index or fetches the changed index after URL commit', async () => {
    const { getNextActiveOptionAfterDelete } = loadSource('src/pages/campaign-managment/model/campaign-management.helpers.ts', {});
    for (const [active, deleted, next] of [[0, 1, 0], [1, 0, 0]]) {
        const h = createHarness(); h.store.getState().initCampaign({ ...campaign(), status: 'proposal' }, active);
        h.store.getState().setCampaignName('Draft'); h.render(['campaign', 'proposal', active]);
        let nextParams;
        const remove = loadHandler(pageFile, 'handleConfirmDeleteOption', {
            ...pageGlobals(h, 'proposal', active), existingOptions: [0, 1],
            deleteOptionModal: { optionIndex: deleted }, getNextActiveOptionAfterDelete,
            setDeleteOptionModal() {}, deleteAdminProposalOption: async () => {}, toast: { success() {}, error() {} },
            setSearchParams: params => { nextParams = params; },
        });
        const removing = remove(); await flush();
        if (active !== next) { await removing; h.render(['campaign', 'proposal', Number(nextParams.get('optionIndex'))]); }
        assert.equal(h.gets.length, 1); assert.equal(h.gets[0].args.optionIndex, next);
        h.gets[0].resolve({ ...campaign(), status: 'proposal' }); await flush(); await removing;
        assert.equal(h.store.getState().activeOptionIndex, next);
    }
});

test('pay promo reloads the current nonzero option', async () => {
    const h = createHarness(); h.store.getState().initCampaign(campaign(), 2);
    h.store.getState().setCampaignName('Draft'); h.render(['campaign', 'pending', 2]);
    const pay = loadHandler('src/widgets/campaign-management/campaign-management-table/ui/campaign-management-insight-table.tsx',
        'handlePayPromo', {
            campaignId: 'campaign', optionIndex: 2, React: { useCallback: callback => callback },
            loadCampaignByOption: h.hook.loadCampaignByOption, payPromoCampaign: async () => {},
            toast: { success() {}, error() {} },
        });
    const paying = pay({ account: { addedAccountsId: 'first' } }); await flush();
    assert.equal(h.gets.length, 1); assert.equal(h.gets[0].args.optionIndex, 2);
    h.gets[0].resolve(campaign()); await paying;
});
