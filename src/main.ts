import './style.css';
import { DEFAULTS, POOLS, STARTING_RATE, format, parseAmount, quote } from './model';

const mark = '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="8"/><path d="M16 2v8m0 12v8M2 16h8m12 0h8M13 16h6"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
const resetIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg>';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a class="skip-link" href="#main">Skip to simulator</a>
  <div class="shell">
    <header class="masthead">
      <div class="wordmark">${mark}<span>Swap Lens</span></div>
      <span class="offline"><span aria-hidden="true">◌</span> Offline simulator</span>
    </header>
    <main id="main">
      <section class="intro" aria-labelledby="page-title">
        <div><p class="eyebrow">An experiment in liquidity</p><h1 id="page-title">See the cost<br />behind the swap<span class="accent-period">.</span></h1></div>
        <div class="intro-copy"><p>The same trade. A different pool.<br />Explore how liquidity changes what you receive.</p><span class="time-label">${arrow} A little clarity, in under a minute</span></div>
      </section>

      <div class="workspace">
        <section class="controls" aria-labelledby="setup-title">
          <div class="section-heading"><span class="step">01</span><h2 id="setup-title">Set up your swap</h2><button id="reset" class="reset" type="button">${resetIcon} Reset</button></div>
          <form id="simulator" novalidate>
            <div class="amount-group">
              <label class="field-label" for="amount">You put in</label>
              <div class="amount-box"><input id="amount" name="amount" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="1" aria-describedby="amount-hint amount-error" /><span class="unit"><svg viewBox="0 0 18 28" aria-hidden="true"><path d="m9 1 8 13-8 5-8-5Zm0 20 8-5-8 11-8-11Z" fill="currentColor"/></svg>ETH</span></div>
              <p id="amount-hint" class="field-hint">Try an amount from 0.001 to 1,000 ETH.</p>
              <p id="amount-error" class="field-error" hidden></p>
              <div class="amount-presets" aria-label="Example trade amounts">${['0.1', '1', '10', '50'].map(a => `<button type="button" data-amount="${a}" aria-label="Use ${a} ETH">${a}<span> ETH</span></button>`).join('')}</div>
            </div>
            <fieldset class="pool-field"><legend>Choose the pool depth</legend><p class="field-hint">More liquidity softens the impact of your trade.</p>
              <div class="pool-options">${POOLS.map((p, i) => `<label class="pool-option"><input type="radio" name="pool" value="${p.id}" ${p.id === DEFAULTS.pool ? 'checked' : ''} /><span class="pool-glyph" aria-hidden="true">${'<i></i>'.repeat(i + 1)}</span><span class="pool-copy"><strong>${p.name}</strong><span>${p.eth.toLocaleString('en-US')} ETH + ${(p.eth * STARTING_RATE).toLocaleString('en-US')} TOKEN</span></span><span class="radio-indicator" aria-hidden="true"></span></label>`).join('')}</div>
            </fieldset>
            <fieldset class="slippage-field"><legend>Slippage tolerance</legend><div class="slippage-options">${['0.1','0.5','1','3'].map(s => `<label><input type="radio" name="slippage" value="${s}" ${s === DEFAULTS.slippage ? 'checked' : ''} /><span>${s}%</span></label>`).join('')}</div><p class="field-hint">Sets your minimum received, not your price impact.</p></fieldset>
          </form>
          <div class="model-tag"><span aria-hidden="true">∿</span> Constant-product model <span class="tag-dot">·</span> 0.3% swap fee</div>
        </section>

        <section id="result-panel" class="result-panel" aria-labelledby="result-title">
          <div class="section-heading"><span class="step">02</span><h2 id="result-title">Look a little closer</h2><span class="simulation-tag">Simulation</span></div>
          <div id="result-content">
            <div class="quote-top"><p class="field-label">You could receive</p><span class="trade-route">ETH ${arrow} TOKEN</span></div>
            <p class="receive"><span id="output">987.16</span><span class="receive-unit">TOKEN</span></p>
            <p class="quote-caption">From the <span id="pool-name">Growing pool</span> · example token, no market data</p>
            <div class="metrics"><div><span>Price impact</span><strong id="impact">0.99%</strong><small>From your trade alone</small></div><div><span>Minimum received</span><strong><span id="minimum">982.22</span> <span class="metric-unit">TOKEN</span></strong><small id="tolerance-note">At 0.5% tolerance</small></div></div>
            <figure class="chart"><figcaption><span>Trade size vs. price impact</span><span class="chart-legend"><i></i> Selected pool</span></figcaption><div id="chart-graphic"></div><div class="chart-axis-label">Trade size (ETH) ${arrow}</div></figure>
            <div class="insight" id="insight"><span class="insight-icon" aria-hidden="true">↗</span><p id="insight-text"></p></div>
            <div class="quote-fee"><span>Swap fee <strong id="fee"></strong></span><span>Gas is not included</span></div>
          </div>
          <div id="empty-result" class="empty-result" hidden>${mark}<h3>A swap starts with an amount.</h3><p>Enter a number from 0.001 to 1,000 ETH to explore the result.</p></div>
        </section>
      </div>

      <section class="takeaway" aria-labelledby="takeaway-title"><span class="takeaway-label" id="takeaway-title">The takeaway</span><p><strong>Price impact is the change your trade causes.</strong> Slippage tolerance is how much less you accept if the quote moves before execution. Raising tolerance does not improve the quote.</p></section>
      <details class="method"><summary>What is this simulation based on?<span aria-hidden="true">+</span></summary><div class="method-content"><p>Each example starts at 1 ETH = 1,000 TOKEN. TOKEN is a fictional asset. All three pools use the same constant-product formula and a 0.3% input fee, so you can isolate the effect of pool depth.</p><p><code>Tokens out = token reserve × net ETH / (ETH reserve + net ETH)</code></p><p>Net ETH is your input after the fee. Price impact compares the output with the starting rate on that net input, excluding the fee. Minimum received is the estimated output × (1 − tolerance). Displayed values are rounded.</p><p>This simplified model excludes gas, token taxes, routing, concentrated liquidity, other trades, and execution rounding. The chart is a set of independent quotes from the same starting reserves, not repeated trades. These are learning examples, not executable quotes.</p></div></details>
      <footer><p><strong>Built for a clearer view.</strong> Swap Lens is an interactive liquidity simulator for Ethereum token holders and the IMD community. We built it to make price impact and slippage easier to understand before a real swap.</p><span class="footer-mark">${mark}<span>Explore. Understand.</span></span></footer>
    </main>
  </div>
  <p id="announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
`;

const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const form = get<HTMLFormElement>('simulator');
const amountInput = get<HTMLInputElement>('amount');
let announcementTimer: ReturnType<typeof setTimeout>;

function announce(message: string) {
  clearTimeout(announcementTimer);
  announcementTimer = setTimeout(() => { get('announcement').textContent = message; }, 350);
}

function drawChart(amount: number, reserve: number, impact: number) {
  const width = Math.max(240, get('chart-graphic').clientWidth), height = 190, left = 44, right = 20, top = 18, bottom = 30;
  const xMax = Math.max(10, amount * 1.25);
  const peak = quote(xMax, reserve, 0).impact;
  const yMax = Math.min(100, Math.ceil(peak / 5) * 5);
  const x = (n: number) => left + n / xMax * (width - left - right);
  const y = (n: number) => height - bottom - n / yMax * (height - top - bottom);
  const points = Array.from({ length: 61 }, (_, i) => {
    const a = xMax * i / 60;
    return `${x(a).toFixed(2)},${y(a === 0 ? 0 : quote(a, reserve, 0).impact).toFixed(2)}`;
  });
  const markerX = x(amount), markerY = y(impact);
  const labelX = Math.min(Math.max(markerX, left + 43), width - right - 43);
  const markerLabel = `${format(amount, amount % 1 ? 3 : 0)} ETH`;
  get('chart-graphic').innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Price impact increases with trade size</title><desc id="chart-desc">For ${format(amount, 3)} ETH in the selected pool, price impact is ${format(impact)} percent. The chart shows independent trades from zero to ${format(xMax)} ETH.</desc>
    ${[0, 0.5, 1].map(f => `<line class="grid-line" x1="${left}" x2="${width - right}" y1="${y(yMax*f)}" y2="${y(yMax*f)}"/><text class="axis-text" x="${left-9}" y="${y(yMax*f)+4}" text-anchor="end">${format(yMax*f, yMax%2 && f===0.5 ? 1 : 0)}%</text>`).join('')}
    <path class="chart-area" d="M${left},${y(0)} L${points.join(' L')} L${x(xMax)},${y(0)} Z"/>
    <polyline class="chart-line" points="${points.join(' ')}"/>
    <line class="marker-line" x1="${markerX}" x2="${markerX}" y1="${markerY}" y2="${y(0)}"/>
    <circle class="chart-marker" cx="${markerX}" cy="${markerY}" r="5"/>
    <rect class="marker-label-bg" x="${labelX-43}" y="${Math.max(0,markerY-34)}" width="86" height="23" rx="4"/>
    <text class="marker-label" x="${labelX}" y="${Math.max(0,markerY-34)+16}" text-anchor="middle">${markerLabel}</text>
    ${[0, 0.5, 1].map(f => `<text class="axis-text" x="${x(xMax*f)}" y="${height-8}" text-anchor="${f===0?'start':f===1?'end':'middle'}">${format(xMax*f,xMax*f%1?2:0)}</text>`).join('')}
  </svg>`;
}

function update(shouldAnnounce = true) {
  const parsed = parseAmount(amountInput.value);
  const error = get('amount-error');
  error.hidden = !parsed.error;
  error.textContent = parsed.error ?? '';
  amountInput.setAttribute('aria-invalid', String(!!parsed.error));
  get('result-content').hidden = !!parsed.error;
  get('empty-result').hidden = !parsed.error;
  document.querySelectorAll<HTMLButtonElement>('[data-amount]').forEach(button => {
    button.setAttribute('aria-pressed', String(parsed.value === Number(button.dataset.amount)));
  });
  if (parsed.error !== null) {
    if (shouldAnnounce) announce(parsed.error);
    return;
  }
  const data = new FormData(form);
  const pool = POOLS.find(p => p.id === data.get('pool'))!;
  const tolerance = Number(data.get('slippage'));
  const result = quote(parsed.value, pool.eth, tolerance);
  get('output').textContent = format(result.output);
  get('impact').textContent = `${format(result.impact)}%`;
  get('minimum').textContent = format(result.minimum);
  get('tolerance-note').textContent = `At ${tolerance}% tolerance`;
  get('pool-name').textContent = pool.name;
  get('fee').textContent = `${format(result.fee, 6)} ETH`;
  const severity = result.impact >= 5 ? 'high' : result.impact >= 1 ? 'moderate' : 'low';
  get('insight').dataset.level = severity;
  const insight = severity === 'high'
    ? `This trade moves the price significantly. Try a deeper pool or a smaller amount to see the difference.`
    : severity === 'moderate'
    ? `Pool depth matters here. Try the same amount in a deeper pool and compare what you receive.`
    : `A small ripple. This pool absorbs your trade with less than 1% price impact. Try a larger amount to see it change.`;
  get('insight-text').textContent = insight;
  drawChart(parsed.value, pool.eth, result.impact);
  if (shouldAnnounce) announce(`${pool.name}: estimated ${format(result.output)} TOKEN. Price impact ${format(result.impact)} percent. Minimum received ${format(result.minimum)} TOKEN.`);
}

form.addEventListener('input', () => update());
form.addEventListener('submit', event => { event.preventDefault(); update(); if (parseAmount(amountInput.value).error) amountInput.focus(); });
document.querySelectorAll<HTMLButtonElement>('[data-amount]').forEach(button => button.addEventListener('click', () => { amountInput.value = button.dataset.amount!; update(); }));
get('reset').addEventListener('click', () => {
  form.reset();
  amountInput.value = DEFAULTS.amount;
  update(false);
  announce('Simulation reset. 1 ETH in the Growing pool, with 0.5% slippage tolerance.');
});
update(false);
let chartWidth = get('chart-graphic').clientWidth;
new ResizeObserver(() => {
  const currentWidth = get('chart-graphic').clientWidth;
  if (currentWidth !== chartWidth) {
    chartWidth = currentWidth;
    update(false);
  }
}).observe(get('result-panel'));
