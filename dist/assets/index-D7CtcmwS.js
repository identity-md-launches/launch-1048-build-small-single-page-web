(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))l(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&l(n)}).observe(document,{childList:!0,subtree:!0});function o(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function l(a){if(a.ep)return;a.ep=!0;const i=o(a);fetch(a.href,i)}})();const A=[{id:"new",name:"New pool",eth:10},{id:"growing",name:"Growing pool",eth:100},{id:"deep",name:"Deep pool",eth:1e3}],K=.003,E=1e3,k={amount:"1",pool:"growing",slippage:"0.5"};function q(e){const t=e.trim();if(!t)return{value:null,error:"Enter an ETH amount to see your estimate."};if(!/^(?:\d+\.?\d*|\.\d+)$/.test(t))return{value:null,error:"Use a number with a decimal point, such as 0.5."};const o=Number(t);return!Number.isFinite(o)||o<.001||o>1e3?{value:null,error:"Enter an amount from 0.001 to 1,000 ETH."}:{value:o,error:null}}function S(e,t,o){if(!Number.isFinite(e)||e<=0||!Number.isFinite(t)||t<=0||!Number.isFinite(o)||o<0||o>=100)throw new RangeError("Use positive finite amounts and reserves, and slippage from 0 to less than 100.");const l=e*K,a=e-l,n=t*E*a/(t+a),u=a/(t+a)*100;return{output:n,impact:u,fee:l,minimum:n*(1-o/100),spotOutput:a*E,effectiveRate:n/e}}function p(e,t=2){return e>0&&e<.01?e.toLocaleString("en-US",{maximumSignificantDigits:3}):e.toLocaleString("en-US",{minimumFractionDigits:t,maximumFractionDigits:t})}const T='<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="8"/><path d="M16 2v8m0 12v8M2 16h8m12 0h8M13 16h6"/></svg>',w='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',U='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg>';document.querySelector("#app").innerHTML=`
  <a class="skip-link" href="#main">Skip to simulator</a>
  <div class="shell">
    <header class="masthead">
      <div class="wordmark">${T}<span>Swap Lens</span></div>
      <span class="offline"><span aria-hidden="true">◌</span> Offline simulator</span>
    </header>
    <main id="main">
      <section class="intro" aria-labelledby="page-title">
        <div><p class="eyebrow">An experiment in liquidity</p><h1 id="page-title">See the cost<br />behind the swap<span class="accent-period">.</span></h1></div>
        <div class="intro-copy"><p>The same trade. A different pool.<br />Explore how liquidity changes what you receive.</p><span class="time-label">${w} A little clarity, in under a minute</span></div>
      </section>

      <div class="workspace">
        <section class="controls" aria-labelledby="setup-title">
          <div class="section-heading"><span class="step">01</span><h2 id="setup-title">Set up your swap</h2><button id="reset" class="reset" type="button">${U} Reset</button></div>
          <form id="simulator" novalidate>
            <div class="amount-group">
              <label class="field-label" for="amount">You put in</label>
              <div class="amount-box"><input id="amount" name="amount" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="1" aria-describedby="amount-hint amount-error" /><span class="unit"><svg viewBox="0 0 18 28" aria-hidden="true"><path d="m9 1 8 13-8 5-8-5Zm0 20 8-5-8 11-8-11Z" fill="currentColor"/></svg>ETH</span></div>
              <p id="amount-hint" class="field-hint">Try an amount from 0.001 to 1,000 ETH.</p>
              <p id="amount-error" class="field-error" hidden></p>
              <div class="amount-presets" aria-label="Example trade amounts">${["0.1","1","10","50"].map(e=>`<button type="button" data-amount="${e}" aria-label="Use ${e} ETH">${e}<span> ETH</span></button>`).join("")}</div>
            </div>
            <fieldset class="pool-field"><legend>Choose the pool depth</legend><p class="field-hint">More liquidity softens the impact of your trade.</p>
              <div class="pool-options">${A.map((e,t)=>`<label class="pool-option"><input type="radio" name="pool" value="${e.id}" ${e.id===k.pool?"checked":""} /><span class="pool-glyph" aria-hidden="true">${"<i></i>".repeat(t+1)}</span><span class="pool-copy"><strong>${e.name}</strong><span>${e.eth.toLocaleString("en-US")} ETH + ${(e.eth*E).toLocaleString("en-US")} TOKEN</span></span><span class="radio-indicator" aria-hidden="true"></span></label>`).join("")}</div>
            </fieldset>
            <fieldset class="slippage-field"><legend>Slippage tolerance</legend><div class="slippage-options">${["0.1","0.5","1","3"].map(e=>`<label><input type="radio" name="slippage" value="${e}" ${e===k.slippage?"checked":""} /><span>${e}%</span></label>`).join("")}</div><p class="field-hint">Sets your minimum received, not your price impact.</p></fieldset>
          </form>
          <div class="model-tag"><span aria-hidden="true">∿</span> Constant-product model <span class="tag-dot">·</span> 0.3% swap fee</div>
        </section>

        <section id="result-panel" class="result-panel" aria-labelledby="result-title">
          <div class="section-heading"><span class="step">02</span><h2 id="result-title">Look a little closer</h2><span class="simulation-tag">Simulation</span></div>
          <div id="result-content">
            <div class="quote-top"><p class="field-label">You could receive</p><span class="trade-route">ETH ${w} TOKEN</span></div>
            <p class="receive"><span id="output">987.16</span><span class="receive-unit">TOKEN</span></p>
            <p class="quote-caption">From the <span id="pool-name">Growing pool</span> · example token, no market data</p>
            <div class="metrics"><div><span>Price impact</span><strong id="impact">0.99%</strong><small>From your trade alone</small></div><div><span>Minimum received</span><strong><span id="minimum">982.22</span> <span class="metric-unit">TOKEN</span></strong><small id="tolerance-note">At 0.5% tolerance</small></div></div>
            <figure class="chart"><figcaption><span>Trade size vs. price impact</span><span class="chart-legend"><i></i> Selected pool</span></figcaption><div id="chart-graphic"></div><div class="chart-axis-label">Trade size (ETH) ${w}</div></figure>
            <div class="insight" id="insight"><span class="insight-icon" aria-hidden="true">↗</span><p id="insight-text"></p></div>
            <div class="quote-fee"><span>Swap fee <strong id="fee"></strong></span><span>Gas is not included</span></div>
          </div>
          <div id="empty-result" class="empty-result" hidden>${T}<h3>A swap starts with an amount.</h3><p>Enter a number from 0.001 to 1,000 ETH to explore the result.</p></div>
        </section>
      </div>

      <section class="takeaway" aria-labelledby="takeaway-title"><span class="takeaway-label" id="takeaway-title">The takeaway</span><p><strong>Price impact is the change your trade causes.</strong> Slippage tolerance is how much less you accept if the quote moves before execution. Raising tolerance does not improve the quote.</p></section>
      <details class="method"><summary>What is this simulation based on?<span aria-hidden="true">+</span></summary><div class="method-content"><p>Each example starts at 1 ETH = 1,000 TOKEN. TOKEN is a fictional asset. All three pools use the same constant-product formula and a 0.3% input fee, so you can isolate the effect of pool depth.</p><p><code>Tokens out = token reserve × net ETH / (ETH reserve + net ETH)</code></p><p>Net ETH is your input after the fee. Price impact compares the output with the starting rate on that net input, excluding the fee. Minimum received is the estimated output × (1 − tolerance). Displayed values are rounded.</p><p>This simplified model excludes gas, token taxes, routing, concentrated liquidity, other trades, and execution rounding. The chart is a set of independent quotes from the same starting reserves, not repeated trades. These are learning examples, not executable quotes.</p></div></details>
      <footer><p><strong>Built for a clearer view.</strong> Swap Lens is an interactive liquidity simulator for Ethereum token holders and the IMD community. We built it to make price impact and slippage easier to understand before a real swap.</p><span class="footer-mark">${T}<span>Explore. Understand.</span></span></footer>
    </main>
  </div>
  <p id="announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
`;const s=e=>document.getElementById(e),$=s("simulator"),h=s("amount");let N;function M(e){clearTimeout(N),N=setTimeout(()=>{s("announcement").textContent=e},350)}function P(e,t,o){const l=Math.max(240,s("chart-graphic").clientWidth),a=190,i=44,n=20,u=18,g=30,c=Math.max(10,e*1.25),F=S(c,t,0).impact,m=Math.min(100,Math.ceil(F/5)*5),v=r=>i+r/c*(l-i-n),d=r=>a-g-r/m*(a-u-g),L=Array.from({length:61},(r,D)=>{const b=c*D/60;return`${v(b).toFixed(2)},${d(b===0?0:S(b,t,0).impact).toFixed(2)}`}),y=v(e),x=d(o),H=Math.min(Math.max(y,i+43),l-n-43),C=`${p(e,e%1?3:0)} ETH`;s("chart-graphic").innerHTML=`<svg viewBox="0 0 ${l} ${a}" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Price impact increases with trade size</title><desc id="chart-desc">For ${p(e,3)} ETH in the selected pool, price impact is ${p(o)} percent. The chart shows independent trades from zero to ${p(c)} ETH.</desc>
    ${[0,.5,1].map(r=>`<line class="grid-line" x1="${i}" x2="${l-n}" y1="${d(m*r)}" y2="${d(m*r)}"/><text class="axis-text" x="${i-9}" y="${d(m*r)+4}" text-anchor="end">${p(m*r,m%2&&r===.5?1:0)}%</text>`).join("")}
    <path class="chart-area" d="M${i},${d(0)} L${L.join(" L")} L${v(c)},${d(0)} Z"/>
    <polyline class="chart-line" points="${L.join(" ")}"/>
    <line class="marker-line" x1="${y}" x2="${y}" y1="${x}" y2="${d(0)}"/>
    <circle class="chart-marker" cx="${y}" cy="${x}" r="5"/>
    <rect class="marker-label-bg" x="${H-43}" y="${Math.max(0,x-34)}" width="86" height="23" rx="4"/>
    <text class="marker-label" x="${H}" y="${Math.max(0,x-34)+16}" text-anchor="middle">${C}</text>
    ${[0,.5,1].map(r=>`<text class="axis-text" x="${v(c*r)}" y="${a-8}" text-anchor="${r===0?"start":r===1?"end":"middle"}">${p(c*r,c*r%1?2:0)}</text>`).join("")}
  </svg>`}function f(e=!0){const t=q(h.value),o=s("amount-error");if(o.hidden=!t.error,o.textContent=t.error??"",h.setAttribute("aria-invalid",String(!!t.error)),s("result-content").hidden=!!t.error,s("empty-result").hidden=!t.error,document.querySelectorAll("[data-amount]").forEach(c=>{c.setAttribute("aria-pressed",String(t.value===Number(c.dataset.amount)))}),t.error!==null){e&&M(t.error);return}const l=new FormData($),a=A.find(c=>c.id===l.get("pool")),i=Number(l.get("slippage")),n=S(t.value,a.eth,i);s("output").textContent=p(n.output),s("impact").textContent=`${p(n.impact)}%`,s("minimum").textContent=p(n.minimum),s("tolerance-note").textContent=`At ${i}% tolerance`,s("pool-name").textContent=a.name,s("fee").textContent=`${p(n.fee,6)} ETH`;const u=n.impact>=5?"high":n.impact>=1?"moderate":"low";s("insight").dataset.level=u;const g=u==="high"?"This trade moves the price significantly. Try a deeper pool or a smaller amount to see the difference.":u==="moderate"?"Pool depth matters here. Try the same amount in a deeper pool and compare what you receive.":"A small ripple. This pool absorbs your trade with less than 1% price impact. Try a larger amount to see it change.";s("insight-text").textContent=g,P(t.value,a.eth,n.impact),e&&M(`${a.name}: estimated ${p(n.output)} TOKEN. Price impact ${p(n.impact)} percent. Minimum received ${p(n.minimum)} TOKEN.`)}$.addEventListener("input",()=>f());$.addEventListener("submit",e=>{e.preventDefault(),f(),q(h.value).error&&h.focus()});document.querySelectorAll("[data-amount]").forEach(e=>e.addEventListener("click",()=>{h.value=e.dataset.amount,f()}));s("reset").addEventListener("click",()=>{$.reset(),h.value=k.amount,f(!1),M("Simulation reset. 1 ETH in the Growing pool, with 0.5% slippage tolerance.")});f(!1);let O=s("chart-graphic").clientWidth;new ResizeObserver(()=>{const e=s("chart-graphic").clientWidth;e!==O&&(O=e,f(!1))}).observe(s("result-panel"));
