const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

// Real React DOM, page/state/delete/draft/query hooks, Zustand, Router and nuqs.
// Only HTTP is substituted, in the browser fixture. No npm browser dependency:
// node:test drives an isolated headless Chromium through its DevTools protocol.
const browser = process.env.PROPOSAL_DELETE_BROWSER || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(file => fs.existsSync(file));
let server, processHandle, profile, port, origin;

before(async () => {
  if (!browser) return;
  const { createServer } = await import('vite');
  server = await createServer({ root: path.resolve(__dirname, '..'), logLevel: 'error',
    server: { host: '127.0.0.1', port: 0, open: false } });
  await server.listen(); origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  profile = fs.mkdtempSync(path.join(os.tmpdir(), 'proposal-delete-browser-'));
  processHandle = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run',
    '--disable-background-networking', '--no-default-browser-check', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  const deadline = Date.now() + 15000;
  while (!fs.existsSync(path.join(profile, 'DevToolsActivePort'))) {
    if (Date.now() > deadline) throw Error('Chromium did not expose DevTools');
    await delay(25);
  }
  port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0];
});

after(async () => {
  if (processHandle) {
    if (processHandle.exitCode === null) {
      const exited = new Promise(resolve => processHandle.once('exit', resolve));
      processHandle.kill(); await Promise.race([exited, delay(2000)]);
    }
  }
  await server?.close();
  if (profile) {
    const target = path.resolve(profile);
    assert.equal(path.dirname(target), path.resolve(os.tmpdir()));
    assert.ok(path.basename(target).startsWith('proposal-delete-browser-'));
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});

async function page(t, query = 'index=0') {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${origin}/tests/proposal-option-delete.browser.html?${query}`)}`, { method: 'PUT' });
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let nextId = 0; const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data), entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.error) entry.reject(Error(JSON.stringify(message.error))); else entry.resolve(message.result);
  });
  const send = (method, params) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(Error(`DevTools timeout: ${method} ${params?.expression?.slice(0,80)}`)); }, 5000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
    socket.send(JSON.stringify({ id, method, params }));
  });
  t.after(async () => { socket.close(); await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`); });
  const evaluate = async (fn, arg) => {
    const result = await send('Runtime.evaluate', { expression: `(${fn})(${JSON.stringify(arg) ?? ''})`, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  const wait = async (predicate, message) => {
    const deadline = Date.now() + 10000;
    while (!await evaluate(`() => Boolean((${predicate})())`)) {
      if (Date.now() > deadline) throw Error(`${message}: ${JSON.stringify(await snapshot())}`);
      await delay(20);
    }
  };
  const click = label => evaluate(label => {
    const button = Array.from(document.querySelectorAll('button')).find(button =>
      button.getAttribute('aria-label') === label || button.textContent.trim() === label);
    if (!button || button.disabled) throw Error(`Button unavailable: ${label}`);
    button.click();
  }, label);
  const snapshot = () => evaluate(() => {
    const t = window.proposalDeleteTest, state = t?.store.getState();
    return { url: location.href, requests: t?.requests.map(({ method, params }) => ({ method, params })),
      draft: state?.draft, baseline: state?.baseline,
      queries: t?.client.getQueryCache().getAll().map(q => ({ key: q.queryKey, fetchStatus: q.state.fetchStatus,
        enabled: q.observers.map(o => o.options.enabled), data: q.state.data })),
      loading: document.body.textContent.includes('Campaign loading'),
      nameReadOnly: document.getElementById('campaign-name')?.readOnly };
  });
  await wait(() => window.proposalDeleteTest?.store.getState().draft && document.getElementById('campaign-name'), 'Initial page did not hydrate');
  const start = async () => {
    await click('Delete current option');
    await wait(() => document.querySelector('[role="dialog"]'), 'Confirmation did not open');
    await click(query.includes('single') ? 'Delete campaign' : 'Delete');
    await wait(() => window.proposalDeleteTest.requests.some(r => r.method === 'delete'), 'DELETE did not start');
  };
  const finishDelete = () => evaluate(() => window.proposalDeleteTest.requests.find(r => r.method === 'delete').resolve());
  const finishGet = () => evaluate(() => {
    const t = window.proposalDeleteTest;
    t.requests.filter(r => r.method === 'get').at(-1).resolve({ ...t.initial, campaignName: 'Remaining snapshot', existingOptions: [0, 1] });
  });
  const recovered = () => wait(() => window.proposalDeleteTest.store.getState().draft?.campaign.campaignName === 'Remaining snapshot' &&
    document.getElementById('campaign-name')?.readOnly === false, 'Recovery did not finish');
  return { evaluate, wait, click, snapshot, start, finishDelete, finishGet, recovered };
}

const options = { skip: !browser && 'Set PROPOSAL_DELETE_BROWSER to an installed Chromium executable', timeout: 30000 };
for (const index of [0, 2]) test(`real page: DELETE ${index} -> GET 0 before draft -> hydration -> unlocked, no second GET`, options, async t => {
  const p = await page(t, `index=${index}`); await p.start(); await p.finishDelete();
  await p.wait(() => window.proposalDeleteTest.requests.filter(r => r.method === 'get').length === 2, 'Recovery GET never started');
  const during = await p.snapshot();
  assert.equal(during.draft, null); assert.equal(during.baseline, null); assert.equal(during.loading, true);
  assert.equal(during.queries.find(q => q.fetchStatus === 'fetching').key[2].optionIndex, 0);
  assert.deepEqual(during.requests.map(r => [r.method, r.params.optionIndex]), [['get', index], ['delete', index], ['get', 0]]);
  await p.finishGet(); await p.recovered();
  // Flush queued React/query/nuqs work; this delay is a test assertion, never recovery logic.
  await delay(150);
  const after = await p.snapshot();
  assert.equal(after.loading, false); assert.equal(after.nameReadOnly, false);
  assert.equal(after.draft.params.optionIndex, 0); assert.deepEqual(after.baseline, after.draft);
  assert.deepEqual(after.queries.find(q => q.key[2].optionIndex === 0).data, after.draft.campaign);
  assert.equal(new URL(after.url).searchParams.get('proposal-option'), '0');
  assert.equal(new URL(after.url).searchParams.get('keep'), 'yes');
  assert.equal(after.requests.length, 3);
});

test('real page: failed GET offers GET-only Retry and then unlocks', options, async t => {
  const p = await page(t, 'index=2'); await p.start(); await p.finishDelete();
  await p.wait(() => window.proposalDeleteTest.requests.length === 3, 'Recovery GET did not start');
  await p.evaluate(() => window.proposalDeleteTest.requests.at(-1).reject());
  await p.wait(() => document.body.textContent.includes('Option deleted. Could not load'), 'Recovery error missing');
  assert.equal((await p.snapshot()).draft, null);
  await p.click('Retry data refresh');
  await p.wait(() => window.proposalDeleteTest.requests.length === 4, 'Retry GET missing');
  await p.finishGet(); await p.recovered(); await delay(150);
  assert.deepEqual((await p.snapshot()).requests.map(r => [r.method, r.params.optionIndex]), [['get', 2], ['delete', 2], ['get', 0], ['get', 0]]);
});

test('real page: single option navigates to campaigns without a recovery GET', options, async t => {
  const p = await page(t, 'index=0&single=1'); await p.start(); await p.finishDelete();
  await p.wait(() => document.body.textContent.includes('Campaigns test list'), 'Campaigns list missing');
  const state = await p.snapshot(); assert.equal(state.requests.length, 2); assert.equal(state.draft, null);
});

test('real page: Cancel and DELETE error preserve draft and visible disabled actions', options, async t => {
  const p = await page(t);
  await p.evaluate(() => window.proposalDeleteTest.store.getState().updateCampaignName('Unsaved name'));
  await p.click('Delete current option');
  await p.wait(() => document.querySelector('[role="dialog"]'), 'Confirmation missing');
  const controls = () => p.evaluate(() => ['Reset changes', 'Save campaign changes', 'Add account'].map(label => {
    const button = document.querySelector(`[aria-label="${label}"]`); return { label, present: Boolean(button), disabled: button?.disabled };
  }));
  assert.ok((await controls()).every(button => button.present && button.disabled));
  await p.click('Cancel');
  await p.wait(() => !document.querySelector('[role="dialog"]'), 'Cancel did not close');
  assert.ok((await controls()).every(button => button.present));
  assert.equal((await p.snapshot()).draft.campaign.campaignName, 'Unsaved name');
  await p.start(); await p.evaluate(() => window.proposalDeleteTest.requests.find(r => r.method === 'delete').reject());
  await p.wait(() => Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'Delete' && !b.disabled), 'DELETE error did not restore confirmation');
  assert.equal((await p.snapshot()).draft.campaign.campaignName, 'Unsaved name');
});

test('real page: late recovery response after leaving cannot hydrate draft', options, async t => {
  const p = await page(t); await p.start(); await p.finishDelete();
  await p.wait(() => window.proposalDeleteTest.requests.length === 3, 'Recovery GET missing');
  await p.evaluate(() => window.proposalDeleteTest.router.navigate('/dashboard/campaigns'));
  await p.finishGet(); await delay(150);
  assert.equal((await p.snapshot()).draft, null);
});
