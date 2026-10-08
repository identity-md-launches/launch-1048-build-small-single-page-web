import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';

// An optional external tool directory keeps dependencies out of restricted workspaces.
const requireTool = createRequire(process.env.SWAP_LENS_TOOL_ROOT ? resolve(process.env.SWAP_LENS_TOOL_ROOT, 'package.json') : resolve('package.json'));
const { chromium } = requireTool('playwright');
const { default: AxeBuilder } = requireTool('@axe-core/playwright');
const root = resolve('dist');
const evidence = resolve('artifacts');
await mkdir(evidence, { recursive: true });
const server = createServer(async (req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end('<!doctype html><html lang="en"><title>Iframe check</title><body style="margin:0"><iframe title="Swap Lens" src="./preview/" sandbox="allow-scripts allow-same-origin" style="width:100%;height:100vh;border:0;display:block"></iframe></body></html>');
  }
  const url = new URL(req.url, 'http://localhost');
  const path = resolve(root, decodeURIComponent(url.pathname.replace(/^\/preview\//, '')) || 'index.html');
  if (!url.pathname.startsWith('/preview/') || !path.startsWith(root + sep)) { res.writeHead(404); return res.end(); }
  try {
    const file = await readFile(path);
    res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[extname(path)] || 'application/octet-stream' });
    res.end(file);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const results = { checks: [], viewports: [], contrast: [], errors: [], requests: [] };
const record = name => { results.checks.push(name); console.log(`PASS ${name}`); };
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') results.errors.push(msg.text()); });
  page.on('requestfailed', req => results.errors.push(`${req.url()}: ${req.failure()?.errorText}`));
  page.on('request', req => results.requests.push(req.url()));
  page.on('response', response => { if (response.status() >= 400) results.errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(`${base}/preview/`);
  await page.waitForSelector('#chart-graphic svg');
  assert.equal(await page.locator('#output').textContent(), '987.16');
  assert.equal(await page.locator('#minimum').textContent(), '982.22');
  record('Production export loads under /preview/ with correct default quote');

  await page.getByLabel('New pool', { exact: false }).check();
  assert.equal(await page.locator('#output').textContent(), '906.61');
  assert.equal(await page.locator('#impact').textContent(), '9.07%');
  assert.equal(await page.locator('#insight').getAttribute('data-level'), 'high');
  await page.getByLabel('Deep pool', { exact: false }).check();
  assert.equal(await page.locator('#output').textContent(), '996.01');
  record('Pool controls change output, price impact, chart, and insight');

  const before = await page.locator('#output').textContent();
  await page.getByText('3%', { exact: true }).click();
  assert.equal(await page.locator('#output').textContent(), before);
  assert.equal(await page.locator('#minimum').textContent(), '966.13');
  record('Slippage changes the minimum without changing the quote');

  await page.getByRole('button', { name: 'Use 50 ETH', exact: true }).click();
  assert.equal(await page.locator('#amount').inputValue(), '50');
  assert.ok((await page.locator('#chart-desc').textContent()).includes('50.000 ETH'));
  for (const value of ['', '-1', 'not a number', '0.0001', '1001', '1,000']) {
    await page.locator('#amount').fill(value);
    assert.equal(await page.locator('#amount').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('#result-content').isVisible(), false);
    assert.equal(await page.locator('#empty-result').isVisible(), true);
    assert.equal(await page.locator('#amount-error').isVisible(), true);
  }
  const errorAudit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(errorAudit.violations.map(v => v.id), []);
  await page.locator('#amount').fill('0.001');
  assert.equal(await page.locator('#fee').textContent(), '0.000003 ETH');
  assert.equal(await page.locator('#result-content').isVisible(), true);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  assert.equal(await page.locator('#amount').inputValue(), '1');
  assert.equal(await page.locator('input[name="pool"]:checked').inputValue(), 'growing');
  assert.equal(await page.locator('input[name="slippage"]:checked').inputValue(), '0.5');
  record('Presets, invalid/empty states, minimum boundary, recovery, and reset work');

  await page.locator('#amount').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('data-amount')), '0.1');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#amount').inputValue(), '0.1');
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.value), 'growing');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('input[name="pool"]:checked').inputValue(), 'deep');
  await page.screenshot({ path: '/tmp/swap-lens-focus.png' });
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('input[name="slippage"]:checked').inputValue(), '1');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.tagName), 'SUMMARY');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('details').getAttribute('open'), '');
  await page.keyboard.press('Enter');
  record('Keyboard supports presets, native radio arrows, and methodology disclosure');

  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  for (const width of [1200, 800, 752, 600, 360, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const layout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    assert.ok(layout.document <= width && layout.body <= width, `Overflow at ${width}: ${JSON.stringify(layout)}`);
    assert.ok(await page.locator('#chart-graphic svg').evaluate(svg => Math.abs(svg.viewBox.baseVal.width - svg.parentElement.clientWidth) <= 1), `Chart did not resize at ${width}`);
    await page.locator('#amount').fill('1000');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Maximum quote overflows at ${width}`);
    await page.locator('#amount').fill('1');
    await page.locator('h1').click();
    results.viewports.push(layout);
    if (width === 1200 || width === 360) await page.screenshot({ path: `${evidence}/${width === 1200 ? 'desktop' : 'mobile'}.png`, fullPage: true });
    if (width === 320) await page.screenshot({ path: '/tmp/swap-lens-320.png', fullPage: true });
  }
  record('Default and maximum quotes have no horizontal overflow at 1200, 800, 752, 600, 360, and 320 px');

  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
  record('Axe WCAG A/AA checks: zero violations in default and invalid states');
  await page.setViewportSize({ width: 1200, height: 1000 });
  results.contrast = await page.evaluate(() => {
    function rgb(value) { return value.match(/[\d.]+/g).slice(0, 3).map(Number); }
    function lum(value) { const c = rgb(value).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return c[0]*0.2126 + c[1]*0.7152 + c[2]*0.0722; }
    return ['.intro-copy > p', '.field-hint', '#output', '.quote-caption', '.slippage-options input:checked + span', '.pool-option:has(input:checked) .pool-copy > span', '.insight p', 'footer > p'].map(selector => {
      const el = document.querySelector(selector); const fg = getComputedStyle(el).color; let node = el, bg;
      while (node) { bg = getComputedStyle(node).backgroundColor; if (bg !== 'rgba(0, 0, 0, 0)') break; node = node.parentElement; }
      const a = lum(fg), b = lum(bg); return { selector, fg, bg, ratio: +((Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)).toFixed(2) };
    });
  });
  assert.ok(results.contrast.every(p => p.ratio >= 4.5));
  record('Eight rendered text/background pairs exceed 4.5:1 contrast');

  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  for (const width of [1200, 360, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Text enlargement overflows at ${width}`);
    await page.screenshot({ path: `/tmp/swap-lens-text-200-${width}.png`, fullPage: true });
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  await page.setViewportSize({ width: 1200, height: 1000 });
  await page.emulateMedia({ forcedColors: 'active' });
  await page.locator('input[value="growing"]').focus();
  await page.screenshot({ path: '/tmp/swap-lens-forced-colors.png', fullPage: true });
  await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'reduce' });
  assert.equal(await page.locator('#reset').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  record('200% text enlargement has no horizontal overflow; reduced motion disables transitions');

  await context.setOffline(true);
  await page.getByRole('button', { name: 'Use 10 ETH', exact: true }).click();
  assert.equal(await page.locator('#output').textContent(), '9,066.11');
  await context.setOffline(false);
  record('Calculations still work with the browser network offline after load');

  await page.goto(base);
  const frame = page.frameLocator('iframe');
  await frame.locator('#amount').fill('10');
  assert.equal(await frame.locator('#output').textContent(), '9,066.11');
  await page.setViewportSize({ width: 360, height: 900 });
  assert.ok(await frame.locator('body').evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  record('Sandboxed iframe works at desktop and 360 px with scripts and same-origin enabled');
  assert.deepEqual(results.errors, []);
  assert.ok(results.requests.every(url => url.startsWith(base)));
  record('No console errors, failed resources, HTTP errors, or external runtime requests');
  console.log(JSON.stringify(results, null, 2));
  await writeFile('/tmp/swap-lens-browser-results.json', JSON.stringify(results, null, 2));
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
}
