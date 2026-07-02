/* CRO Platform dashboard — vanilla JS SPA, hash routing. */
'use strict';

const main = document.getElementById('main');

// ------------------------------------------------------------------ utils

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || (data.errors && data.errors.join('; ')) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function pct(n, digits = 2) {
  return n == null ? '—' : (n * 100).toFixed(digits) + '%';
}

function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (isError ? ' error' : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 3500);
}

function statusBadge(status) {
  const map = { running: 'green', draft: 'gray', stopped: 'amber' };
  return `<span class="badge ${map[status] || 'gray'}">${esc(status)}</span>`;
}

function gradeBadge(grade) {
  const map = { A: 'green', B: 'green', C: 'amber', D: 'red', F: 'red' };
  return grade ? `<span class="badge ${map[grade] || 'gray'}">${esc(grade)}</span>` : '—';
}

function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

// ------------------------------------------------------------------ auth

let currentUser = null;

async function ensureAuth() {
  if (currentUser) return true;
  try {
    currentUser = (await api('/api/auth/me')).user;
    updateSidebarUser();
    return true;
  } catch {
    renderAuthScreen();
    return false;
  }
}

function updateSidebarUser() {
  const foot = document.querySelector('.sidebar-foot');
  if (!foot) return;
  if (currentUser) {
    foot.innerHTML = `<div style="margin-bottom:6px">${esc(currentUser.email)}</div>
      <a href="#" id="logout-link" class="back-link">Sign out</a>`;
    document.getElementById('logout-link').addEventListener('click', async (e) => {
      e.preventDefault();
      await api('/api/auth/logout', { method: 'POST' });
      currentUser = null;
      renderAuthScreen();
    });
  } else {
    foot.textContent = 'MVP · zero-dependency Node.js';
  }
}

function renderAuthScreen(mode = 'login') {
  updateSidebarUser();
  const isLogin = mode === 'login';
  main.innerHTML = `
    <div style="max-width:420px;margin:8vh auto 0">
      <h1 style="text-align:center">${isLogin ? 'Welcome back' : 'Create your account'}</h1>
      <p class="page-sub" style="text-align:center">${isLogin ? 'Sign in to your CRO workspace.' : 'Set up your workspace and start optimizing.'}</p>
      <div class="card">
        <form id="auth-form" class="panel-form">
          ${isLogin ? '' : '<div><label>Name</label><input name="name" placeholder="Jamie from Glow Ritual"></div>'}
          <div><label>Email</label><input name="email" type="email" placeholder="you@brand.com" required></div>
          <div><label>Password</label><input name="password" type="password" minlength="8" placeholder="${isLogin ? 'Your password' : 'At least 8 characters'}" required></div>
          <button type="submit">${isLogin ? 'Sign in' : 'Create account'}</button>
        </form>
        <p class="muted mt" style="text-align:center">
          ${isLogin ? 'No account yet? <a href="#" id="auth-toggle" class="back-link">Sign up</a>'
    : 'Already registered? <a href="#" id="auth-toggle" class="back-link">Sign in</a>'}
        </p>
        <p class="muted" style="text-align:center;font-size:12px">Demo workspace: demo@example.com / demo1234 (after seeding)</p>
      </div>
    </div>
  `;
  document.getElementById('auth-toggle').addEventListener('click', (e) => {
    e.preventDefault();
    renderAuthScreen(isLogin ? 'signup' : 'login');
  });
  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const r = await api(`/api/auth/${isLogin ? 'login' : 'signup'}`, {
        method: 'POST',
        body: { email: fd.get('email'), password: fd.get('password'), name: fd.get('name') || undefined },
      });
      currentUser = r.user;
      updateSidebarUser();
      toast(isLogin ? 'Signed in' : 'Account created — welcome!');
      render();
    } catch (err) { toast(err.message, true); }
  });
}

// ------------------------------------------------------------------ pages

const pages = {};

pages.dashboard = async () => {
  const [overview, experiments, audits, insightData] = await Promise.all([
    api('/api/overview'), api('/api/experiments'), api('/api/audits'), api('/api/insights'),
  ]);
  const running = experiments.filter((e) => e.status === 'running');
  const topInsights = insightData.insights.filter((i) => i.severity !== 'info').slice(0, 3);
  main.innerHTML = `
    <h1>Dashboard</h1>
    <p class="page-sub">Ads, funnel, experiments, and revenue — the full picture.</p>
    <div class="grid cols-4">
      ${metric('Unique visitors', overview.visitors.toLocaleString())}
      ${metric('Conversions', overview.conversions.toLocaleString())}
      ${metric('Revenue', '$' + overview.revenue.toLocaleString())}
      ${metric('Ad spend', '$' + overview.spend.toLocaleString())}
      ${metric('Blended ROAS', overview.roas == null ? '—' : overview.roas + '<small>x</small>')}
      ${metric('Running experiments', overview.runningExperiments, `${overview.experiments} total`)}
      ${metric('Events collected', overview.events.toLocaleString())}
      ${metric('Latest audit score', overview.lastAuditScore == null ? '—' : overview.lastAuditScore + '<small>/100</small>')}
    </div>
    ${topInsights.length ? `<h2>Needs attention <a class="back-link" href="#/insights" style="font-weight:400">— all insights →</a></h2>
      <div class="grid cols-3">${topInsights.map(insightCard).join('')}</div>` : ''}
    <h2>Running experiments</h2>
    ${running.length ? `<div class="card" style="padding:0">${experimentTable(running)}</div>`
      : `<div class="empty">No running experiments. <a class="back-link" href="#/experiments">Create one →</a></div>`}
    <h2>Recent audits</h2>
    ${audits.length ? `<div class="card" style="padding:0">${auditTable(audits.slice(0, 5))}</div>`
      : `<div class="empty">No audits yet. <a class="back-link" href="#/audits">Run your first audit →</a></div>`}
  `;
  bindRowLinks();
};

function metric(label, value, sub) {
  return `<div class="card"><div class="metric-label">${label}</div>
    <div class="metric-value">${value}${sub ? ` <small>${sub}</small>` : ''}</div></div>`;
}

// ---------- sites ----------

pages.sites = async () => {
  const sites = await api('/api/sites');
  main.innerHTML = `
    <h1>Sites</h1>
    <p class="page-sub">Each site is a brand storefront you track and test on.</p>
    <div class="card">
      <h3>Add a site</h3>
      <form id="site-form" class="inline-form">
        <div><label>Brand name</label><input name="name" placeholder="Acme Skincare" required></div>
        <div><label>URL</label><input name="url" placeholder="https://acmeskincare.com"></div>
        <div><label>Platform</label>
          <select name="platform">
            <option value="shopify">Shopify</option>
            <option value="woocommerce">WooCommerce</option>
            <option value="webflow">Webflow</option>
            <option value="custom" selected>Custom</option>
          </select></div>
        <button type="submit">Add site</button>
      </form>
    </div>
    <h2>Your sites</h2>
    ${sites.length ? `<div class="card" style="padding:0"><table>
      <tr><th>Name</th><th>URL</th><th>Platform</th><th>Experiments</th><th>Audits</th><th>Site ID</th><th></th></tr>
      ${sites.map((s) => `<tr>
        <td><strong>${esc(s.name)}</strong></td>
        <td class="muted">${esc(s.url || '—')}</td>
        <td>${esc(s.platform)}</td>
        <td>${s.experimentCount}</td>
        <td>${s.auditCount}</td>
        <td><code class="muted">${esc(s.id)}</code></td>
        <td class="row-actions">
          <button class="secondary small" data-status="${esc(s.id)}">Setup status</button>
          <button class="danger small" data-del="${esc(s.id)}">Delete</button>
        </td>
      </tr>`).join('')}
    </table></div>` : '<div class="empty">No sites yet — add your first brand above.</div>'}
    <div id="site-status"></div>
  `;
  document.getElementById('site-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api('/api/sites', { method: 'POST', body: Object.fromEntries(fd) });
      toast('Site added');
      render();
    } catch (err) { toast(err.message, true); }
  });
  main.querySelectorAll('[data-del]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this site?')) return;
      await api(`/api/sites/${btn.dataset.del}`, { method: 'DELETE' });
      toast('Site deleted');
      render();
    })
  );
  const CHECK_LABELS = {
    snippetInstalled: 'Snippet installed (events received)',
    receivingTraffic: 'Receiving traffic in the last 24h',
    attributionSeen: 'Attribution captured (UTM/referrer touches)',
    funnelStepTracked: 'Funnel steps tracked (add_to_cart…)',
    conversionTracked: 'Conversions tracked',
    revenueTracked: 'Revenue values on conversions',
    vitalsCollected: 'Web vitals collected',
    campaignAdded: 'Ad campaign spend added',
    experimentRunning: 'An experiment is running',
    ga4Connected: 'GA4 connected',
  };
  main.querySelectorAll('[data-status]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const s = await api(`/api/sites/${btn.dataset.status}/status`);
      document.getElementById('site-status').innerHTML = `<div class="card mt">
        <h3>Setup status ${s.installed ? '<span class="badge green">live</span>' : '<span class="badge amber">waiting for first event</span>'}
          <span class="muted" style="font-weight:400;font-size:13px;margin-left:8px">${s.completed}/${s.total} complete
          ${s.lastEventAt ? ` · last event ${fmtDate(s.lastEventAt)}` : ''} · ${s.eventsLast24h.toLocaleString()} events in 24h</span></h3>
        ${Object.entries(s.checklist).map(([k, ok]) => `<div class="check-row">
          <div class="check-icon">${ok ? '✅' : '⬜'}</div>
          <div>${esc(CHECK_LABELS[k] || k)}</div>
        </div>`).join('')}
        ${!s.installed ? '<p class="muted mt">Install the snippet (see <a class="back-link" href="#/install">Install snippet</a>), open your site, then check again.</p>' : ''}
      </div>`;
    })
  );
};

// ---------- experiments ----------

function experimentTable(experiments) {
  return `<table>
    <tr><th>Name</th><th>Goal</th><th>Status</th><th>Variants</th><th>Created</th></tr>
    ${experiments.map((e) => `<tr class="clickable" data-href="#/experiments/${esc(e.id)}">
      <td><strong>${esc(e.name)}</strong></td>
      <td>${esc(e.goal)}</td>
      <td>${statusBadge(e.status)}</td>
      <td>${e.variants.length}</td>
      <td class="muted">${fmtDate(e.createdAt)}</td>
    </tr>`).join('')}
  </table>`;
}

pages.experiments = async () => {
  const [experiments, sites, segs] = await Promise.all([
    api('/api/experiments'), api('/api/sites'), api('/api/segments'),
  ]);
  main.innerHTML = `
    <h1>Experiments</h1>
    <p class="page-sub">A/B tests with deterministic bucketing and significance testing.</p>
    <div class="card">
      <h3>New experiment</h3>
      ${sites.length ? experimentForm(sites, segs) : '<p class="muted">Add a site first on the <a class="back-link" href="#/sites">Sites page</a>.</p>'}
    </div>
    <h2>All experiments</h2>
    ${experiments.length ? `<div class="card" style="padding:0">${experimentTable(experiments)}</div>`
      : '<div class="empty">No experiments yet.</div>'}
  `;
  bindRowLinks();
  bindExperimentForm();
};

function experimentForm(sites, segs = []) {
  return `<form id="exp-form" class="panel-form">
    <div class="form-row">
      <div><label>Name</label><input name="name" placeholder="Hero headline test" required></div>
      <div><label>Site</label><select name="siteId">
        ${sites.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}
      </select></div>
      <div><label>Conversion goal</label><input name="goal" placeholder="purchase" value="purchase" required></div>
    </div>
    <div class="form-row">
      <div><label>Hypothesis (optional)</label><input name="hypothesis" placeholder="Outcome-focused headline will lift CTA clicks"></div>
      <div><label>Page targeting (URL contains — optional)</label><input name="url" placeholder="/products/"></div>
      <div><label>Audience</label><select name="segmentId"><option value="">All visitors</option>
        ${segs.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}</select></div>
    </div>
    <div id="variants">
      ${variantBlock(0, 'Control')}${variantBlock(1, 'Variant B')}
    </div>
    <div class="row-actions">
      <button type="button" class="secondary" id="add-variant">+ Add variant</button>
      <button type="submit">Create experiment</button>
    </div>
  </form>`;
}

function variantBlock(i, defaultName) {
  return `<div class="variant-block">
    <div class="form-row">
      <div><label>Variant ${i === 0 ? '(control)' : String.fromCharCode(65 + i)}</label>
        <input name="v-name-${i}" value="${esc(defaultName)}" required></div>
      <div><label>Weight</label><input name="v-weight-${i}" type="number" min="1" value="1"></div>
    </div>
    ${i === 0 ? '' : `<div class="form-row mt">
      <div><label>DOM change selector (optional)</label><input name="v-selector-${i}" placeholder="h1.hero-title"></div>
      <div><label>Change type</label><select name="v-type-${i}">
        <option value="text">Replace text</option><option value="html">Replace HTML</option>
        <option value="style">Append CSS</option><option value="hide">Hide element</option>
      </select></div>
      <div><label>New value</label><input name="v-value-${i}" placeholder="Glowing skin in 14 days — guaranteed"></div>
    </div>`}
  </div>`;
}

function bindExperimentForm() {
  const form = document.getElementById('exp-form');
  if (!form) return;
  let count = 2;
  document.getElementById('add-variant').addEventListener('click', () => {
    document.getElementById('variants').insertAdjacentHTML('beforeend', variantBlock(count, `Variant ${String.fromCharCode(65 + count)}`));
    count++;
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const variants = [];
    for (let i = 0; i < count; i++) {
      const name = fd.get(`v-name-${i}`);
      if (!name) continue;
      const v = { name, weight: Number(fd.get(`v-weight-${i}`)) || 1, changes: [] };
      const selector = fd.get(`v-selector-${i}`);
      if (selector && fd.get(`v-value-${i}`) !== null) {
        v.changes.push({ selector, type: fd.get(`v-type-${i}`) || 'text', value: fd.get(`v-value-${i}`) || '' });
      } else if (selector && fd.get(`v-type-${i}`) === 'hide') {
        v.changes.push({ selector, type: 'hide', value: '' });
      }
      variants.push(v);
    }
    try {
      const exp = await api('/api/experiments', {
        method: 'POST',
        body: {
          name: fd.get('name'), siteId: fd.get('siteId'), goal: fd.get('goal'),
          hypothesis: fd.get('hypothesis'), url: fd.get('url'),
          segmentId: fd.get('segmentId') || undefined, variants,
        },
      });
      toast('Experiment created');
      location.hash = `#/experiments/${exp.id}`;
    } catch (err) { toast(err.message, true); }
  });
}

pages.experimentDetail = async (id, segmentFilter = '') => {
  const [exp, results, segs] = await Promise.all([
    api(`/api/experiments/${id}`),
    api(`/api/experiments/${id}/results${segmentFilter ? `?segment=${encodeURIComponent(segmentFilter)}` : ''}`),
    api('/api/segments'),
  ]);
  const audience = exp.segmentId ? segs.find((s) => s.id === exp.segmentId) : null;
  const control = results.variants[0];
  main.innerHTML = `
    <a class="back-link" href="#/experiments">← All experiments</a>
    <h1 style="margin-top:10px">${esc(exp.name)} ${statusBadge(exp.status)}</h1>
    <p class="page-sub">Goal: <strong>${esc(exp.goal)}</strong>
      · Audience: <strong>${audience ? esc(audience.name) : 'All visitors'}</strong>
      ${exp.hypothesis ? ` · Hypothesis: ${esc(exp.hypothesis)}` : ''}
      ${exp.url ? ` · Targets URLs containing <code>${esc(exp.url)}</code>` : ''}</p>
    <div class="row-actions" style="margin-bottom:20px">
      ${exp.status !== 'running' ? `<button data-status="running">▶ Start</button>` : ''}
      ${exp.status === 'running' ? `<button class="secondary" data-status="stopped">■ Stop</button>` : ''}
      <button class="danger" id="del-exp">Delete</button>
    </div>
    ${results.srm.srm ? `<div class="card" style="border-color:var(--red);margin-bottom:14px">
      ⚠️ <strong>Sample ratio mismatch detected</strong> (p=${results.srm.pValue}). Traffic split doesn't match variant weights — results may be invalid.</div>` : ''}
    <h2>Results${segmentFilter ? ' <span class="muted">(segment breakdown)</span>' : ''}</h2>
    <div class="inline-form" style="margin-bottom:12px">
      <div style="max-width:280px"><label>Break down by audience</label>
        <select id="seg-breakdown"><option value="">All visitors</option>
          ${segs.map((s) => `<option value="${esc(s.id)}" ${segmentFilter === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
        </select></div>
    </div>
    <div class="card" style="padding:0"><table>
      <tr><th>Variant</th><th>Visitors</th><th>Conversions</th><th>Rate</th><th>95% CI</th><th>Uplift vs control</th><th>Significance</th></tr>
      ${results.variants.map((v, i) => {
        const cmp = i === 0 ? null : results.comparisons.find((c) => c.variantId === v.id);
        const t = cmp && cmp.vsControl;
        return `<tr>
          <td><strong>${esc(v.name)}</strong>${i === 0 ? ' <span class="muted">(control)</span>' : ''}</td>
          <td>${v.visitors.toLocaleString()}</td>
          <td>${v.conversions.toLocaleString()}</td>
          <td><strong>${pct(v.rate)}</strong></td>
          <td class="muted">${pct(v.interval.low)} – ${pct(v.interval.high)}</td>
          <td>${t ? upliftCell(t) : '—'}</td>
          <td>${t ? sigCell(t) : '—'}</td>
        </tr>`;
      }).join('')}
    </table></div>
    <div class="grid cols-3 mt">
      ${metric('Control rate', pct(control.rate))}
      ${metric('Required sample / variant', results.guidance.requiredSamplePerVariant ? results.guidance.requiredSamplePerVariant.toLocaleString() : '—')}
      ${metric('SRM check', results.srm.checked ? (results.srm.srm ? '⚠️ Failed' : '✓ Passed') : 'Needs 100+ visitors')}
    </div>
    <p class="muted mt">${esc(results.guidance.note)}</p>
    <h2>Variants & DOM changes</h2>
    ${exp.variants.map((v) => `<div class="variant-block">
      <strong>${esc(v.name)}</strong> <span class="muted">weight ${v.weight}</span>
      ${v.changes.length ? `<pre class="code mt">${esc(JSON.stringify(v.changes, null, 2))}</pre>` : '<div class="muted mt">No DOM changes (control experience).</div>'}
    </div>`).join('')}
  `;
  document.getElementById('seg-breakdown').addEventListener('change', (e) =>
    pages.experimentDetail(id, e.target.value));
  main.querySelectorAll('[data-status]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      await api(`/api/experiments/${id}/status`, { method: 'POST', body: { status: btn.dataset.status } });
      toast(`Experiment ${btn.dataset.status}`);
      render();
    })
  );
  document.getElementById('del-exp').addEventListener('click', async () => {
    if (!confirm('Delete this experiment?')) return;
    await api(`/api/experiments/${id}`, { method: 'DELETE' });
    location.hash = '#/experiments';
  });
};

function upliftCell(t) {
  if (t == null || t.uplift == null) return '—';
  const up = t.uplift >= 0;
  return `<span class="badge ${up ? 'green' : 'red'}">${up ? '+' : ''}${(t.uplift * 100).toFixed(1)}%</span>`;
}

function sigCell(t) {
  if (!t) return '—';
  return t.significant
    ? `<span class="badge green">significant (p=${t.pValue.toFixed(4)})</span>`
    : `<span class="badge gray">not yet (p=${t.pValue.toFixed(4)})</span>`;
}

// ---------- audits ----------

function auditTable(audits) {
  return `<table>
    <tr><th>URL</th><th>Score</th><th>Grade</th><th>When</th></tr>
    ${audits.map((a) => `<tr class="clickable" data-href="#/audits/${esc(a.id)}">
      <td><strong>${esc(a.url)}</strong></td>
      <td>${a.score == null ? '—' : a.score + '/100'}</td>
      <td>${gradeBadge(a.grade)}</td>
      <td class="muted">${fmtDate(a.createdAt)}</td>
    </tr>`).join('')}
  </table>`;
}

pages.audits = async () => {
  const [audits, sites] = await Promise.all([api('/api/audits'), api('/api/sites')]);
  main.innerHTML = `
    <h1>CRO Audits</h1>
    <p class="page-sub">Score any page against ${'16'} conversion heuristics and get a prioritized plan.</p>
    <div class="card">
      <h3>Run an audit</h3>
      <form id="audit-form" class="inline-form">
        <div style="flex:2"><label>Page URL</label><input name="url" placeholder="https://yourbrand.com/products/best-seller" required></div>
        <div><label>Site (optional)</label><select name="siteId"><option value="">—</option>
          ${sites.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}</select></div>
        <button type="submit" id="audit-btn">Audit page</button>
      </form>
    </div>
    <h2>Past audits</h2>
    ${audits.length ? `<div class="card" style="padding:0">${auditTable(audits)}</div>` : '<div class="empty">No audits yet.</div>'}
  `;
  bindRowLinks();
  document.getElementById('audit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('audit-btn');
    btn.disabled = true; btn.textContent = 'Auditing…';
    const fd = new FormData(e.target);
    try {
      const audit = await api('/api/audits', {
        method: 'POST',
        body: { url: fd.get('url'), siteId: fd.get('siteId') || undefined },
      });
      location.hash = `#/audits/${audit.id}`;
    } catch (err) {
      toast(err.message, true);
      btn.disabled = false; btn.textContent = 'Audit page';
    }
  });
};

pages.auditDetail = async (id) => {
  const audit = await api(`/api/audits/${id}`);
  const r = audit.report;
  const scoreColor = r.score >= 75 ? 'var(--green)' : r.score >= 50 ? 'var(--amber)' : 'var(--red)';
  main.innerHTML = `
    <a class="back-link" href="#/audits">← All audits</a>
    <h1 style="margin-top:10px">Audit: ${esc(audit.url)}</h1>
    <p class="page-sub">Run ${fmtDate(audit.createdAt)}${audit.status ? ` · HTTP ${audit.status}` : ''}</p>
    <div class="grid cols-4">
      <div class="card"><div class="metric-label">Score</div>
        <div class="score-ring" style="color:${scoreColor}">${r.score}<small class="muted" style="font-size:16px">/100</small></div>
        <div class="mt">${gradeBadge(r.grade)}</div></div>
      ${metric('Checks passed', `${r.checks.filter((c) => c.passed).length}<small>/${r.checks.length}</small>`)}
      ${metric('Page weight', `${r.stats.htmlKb}<small> KB</small>`)}
      ${metric('Scripts', r.stats.scripts)}
    </div>
    <h2>Checks</h2>
    <div class="card">
      ${r.checks.map((c) => `<div class="check-row">
        <div class="check-icon">${c.passed ? '✅' : '❌'}</div>
        <div>
          <strong>${esc(c.label)}</strong>
          ${c.skill ? `<span class="badge blue" style="margin-left:8px">${esc(c.skill)}</span>` : ''}
          <div class="check-detail">${esc(c.detail)}</div>
        </div>
      </div>`).join('')}
    </div>
    <h2>Recommended plan (from failed checks)</h2>
    ${audit.plan && audit.plan.length ? `<div class="grid cols-2">
      ${audit.plan.map((p) => playbookCard(p)).join('')}
    </div>` : '<div class="empty">All checks passed — run experiments to keep improving.</div>'}
  `;
};

// ---------- playbooks ----------

function playbookCard(p) {
  const impactColor = { high: 'green', medium: 'amber', low: 'gray' }[p.impact];
  return `<div class="card">
    <h3>${esc(p.title)}</h3>
    <div style="margin-bottom:8px">
      <span class="badge ${impactColor}">${esc(p.impact)} impact</span>
      <span class="badge gray">${esc(p.effort)} effort</span>
      <span class="badge blue">${esc(p.category)}</span>
    </div>
    <p class="muted" style="font-size:13.5px;line-height:1.5">${esc(p.description)}</p>
    <p class="muted mt" style="font-size:12.5px">Methodology: <code>skills/${esc(p.skill)}</code></p>
  </div>`;
}

pages.playbooks = async (category) => {
  const data = await api('/api/playbooks' + (category ? `?category=${encodeURIComponent(category)}` : ''));
  main.innerHTML = `
    <h1>Playbooks</h1>
    <p class="page-sub">Proven CRO plays for DTC brands, mapped to the marketing skills library.</p>
    <div class="pill-row">
      <span class="pill ${!category ? 'active' : ''}" data-cat="">All</span>
      ${data.categories.map((c) => `<span class="pill ${c === category ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</span>`).join('')}
    </div>
    <div class="grid cols-2">${data.playbooks.map(playbookCard).join('')}</div>
  `;
  main.querySelectorAll('.pill').forEach((pill) =>
    pill.addEventListener('click', () => pages.playbooks(pill.dataset.cat || undefined))
  );
};

// ---------- channels (ads performance) ----------

function money(n) {
  return n == null ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

pages.channels = async (model = 'last') => {
  const [report, campaigns, sites] = await Promise.all([
    api(`/api/channels?model=${model}`), api('/api/campaigns'), api('/api/sites'),
  ]);
  const t = report.totals;
  main.innerHTML = `
    <h1>Ads &amp; Channels</h1>
    <p class="page-sub">Every session attributed to its source. Add campaign spend to see ROAS and CPA per channel.</p>
    <div class="pill-row">
      <span class="pill ${model === 'last' ? 'active' : ''}" data-model="last">Last touch</span>
      <span class="pill ${model === 'first' ? 'active' : ''}" data-model="first">First touch</span>
    </div>
    <div class="grid cols-4">
      ${metric('Visitors', t.visitors.toLocaleString())}
      ${metric('Conversions', t.conversions.toLocaleString(), pct(t.cvr, 1) + ' CVR')}
      ${metric('Revenue', money(t.revenue))}
      ${metric('Spend', money(t.spend))}
      ${metric('Blended ROAS', t.roas == null ? '—' : t.roas + '<small>x</small>')}
      ${metric('Blended CPA', money(t.cpa))}
    </div>
    <h2>Performance by channel (${model} touch)</h2>
    ${report.rows.length ? `<div class="card" style="padding:0;overflow-x:auto"><table>
      <tr><th>Source / Medium / Campaign</th><th>Visitors</th><th>Conv.</th><th>CVR</th><th>Revenue</th><th>Spend</th><th>ROAS</th><th>CPA</th><th>CPC</th><th>CTR</th></tr>
      ${report.rows.map((r) => `<tr>
        <td><strong>${esc(r.source)}</strong> <span class="muted">/ ${esc(r.medium)} / ${esc(r.campaign)}</span></td>
        <td>${r.visitors.toLocaleString()}</td>
        <td>${r.conversions.toLocaleString()}</td>
        <td>${pct(r.cvr, 1)}</td>
        <td>${money(r.revenue)}</td>
        <td>${r.hasSpend ? money(r.spend) : '<span class="muted">—</span>'}</td>
        <td>${roasBadge(r)}</td>
        <td>${money(r.cpa)}</td>
        <td>${money(r.cpc)}</td>
        <td>${r.ctr == null ? '—' : pct(r.ctr, 2)}</td>
      </tr>`).join('')}
    </table></div>` : '<div class="empty">No attributed traffic yet — install the snippet and drive some visits.</div>'}
    <h2>Campaign spend entries</h2>
    <div class="card">
      <h3>Add spend (from your ad platform)</h3>
      <p class="muted" style="margin-bottom:12px">Enter spend per campaign with the exact UTM values used on the ads. For automated pulls, see <code>tools/integrations/google-ads.md</code> and <code>tools/integrations/composio.md</code> (Meta Ads) in this repo.</p>
      <form id="campaign-form" class="inline-form">
        <div><label>Name</label><input name="name" placeholder="Prospecting broad" required></div>
        <div><label>utm_source</label><input name="utmSource" placeholder="meta" required></div>
        <div><label>utm_medium</label><input name="utmMedium" placeholder="cpc" value="cpc"></div>
        <div><label>utm_campaign</label><input name="utmCampaign" placeholder="prospecting-broad"></div>
        <div><label>Spend ($)</label><input name="spend" type="number" step="0.01" min="0" required></div>
        <div><label>Clicks</label><input name="clicks" type="number" min="0"></div>
        <div><label>Impressions</label><input name="impressions" type="number" min="0"></div>
        <div><label>Site (optional)</label><select name="siteId"><option value="">All</option>
          ${sites.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}</select></div>
        <button type="submit">Add</button>
      </form>
    </div>
    ${campaigns.length ? `<div class="card mt" style="padding:0"><table>
      <tr><th>Name</th><th>UTMs</th><th>Spend</th><th>Clicks</th><th>Impressions</th><th></th></tr>
      ${campaigns.map((c) => `<tr>
        <td><strong>${esc(c.name)}</strong></td>
        <td class="muted">${esc(c.utmSource)} / ${esc(c.utmMedium)} / ${esc(c.utmCampaign || '(none)')}</td>
        <td>${money(c.spend)}</td><td>${c.clicks.toLocaleString()}</td><td>${c.impressions.toLocaleString()}</td>
        <td><button class="danger small" data-del-campaign="${esc(c.id)}">Delete</button></td>
      </tr>`).join('')}
    </table></div>` : ''}
    <h2>UTM link builder</h2>
    <div class="card">
      <form id="utm-form" class="inline-form">
        <div style="flex:2"><label>Landing page URL</label><input name="base" placeholder="https://yourbrand.com/products/serum" required></div>
        <div><label>utm_source</label><input name="source" placeholder="meta" required></div>
        <div><label>utm_medium</label><input name="medium" placeholder="cpc" value="cpc"></div>
        <div><label>utm_campaign</label><input name="campaign" placeholder="prospecting-broad"></div>
        <div><label>utm_content</label><input name="content" placeholder="video-hook-a"></div>
        <button type="submit">Build</button>
      </form>
      <pre class="code mt hidden" id="utm-output"></pre>
    </div>
  `;
  main.querySelectorAll('[data-model]').forEach((pill) =>
    pill.addEventListener('click', () => pages.channels(pill.dataset.model))
  );
  document.getElementById('campaign-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api('/api/campaigns', {
        method: 'POST',
        body: {
          name: fd.get('name'), utmSource: fd.get('utmSource'), utmMedium: fd.get('utmMedium'),
          utmCampaign: fd.get('utmCampaign'), siteId: fd.get('siteId') || undefined,
          spend: Number(fd.get('spend')),
          clicks: fd.get('clicks') ? Number(fd.get('clicks')) : 0,
          impressions: fd.get('impressions') ? Number(fd.get('impressions')) : 0,
        },
      });
      toast('Campaign spend added');
      pages.channels(model);
    } catch (err) { toast(err.message, true); }
  });
  main.querySelectorAll('[data-del-campaign]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      await api(`/api/campaigns/${btn.dataset.delCampaign}`, { method: 'DELETE' });
      toast('Deleted');
      pages.channels(model);
    })
  );
  document.getElementById('utm-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const url = new URL(fd.get('base'));
      const clean = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '-');
      ['source', 'medium', 'campaign', 'content'].forEach((k) => {
        if (fd.get(k)) url.searchParams.set('utm_' + k, clean(fd.get(k)));
      });
      const out = document.getElementById('utm-output');
      out.textContent = url.toString();
      out.classList.remove('hidden');
    } catch { toast('Enter a valid URL (including https://)', true); }
  });
};

function roasBadge(r) {
  if (r.roas == null) return '—';
  const cls = r.roas >= 3 ? 'green' : r.roas >= 1 ? 'amber' : 'red';
  return `<span class="badge ${cls}">${r.roas}x</span>`;
}

// ---------- funnel ----------

pages.funnel = async (state = {}) => {
  const qs = new URLSearchParams();
  if (state.funnelId) qs.set('funnelId', state.funnelId);
  if (state.segment) qs.set('segment', state.segment);
  if (state.source) qs.set('source', state.source);
  const [funnel, funnels, segs, channels] = await Promise.all([
    api('/api/funnel' + (qs.toString() ? `?${qs}` : '')),
    api('/api/funnels'), api('/api/segments'), api('/api/channels'),
  ]);
  const sources = [...new Set(channels.rows.filter((r) => r.visitors > 0).map((r) => r.source))];
  const maxVisitors = Math.max(1, ...funnel.stages.map((s) => s.visitors));
  main.innerHTML = `
    <h1>Funnels</h1>
    <p class="page-sub">Build any funnel from pageviews, tracked steps, and conversions — then compare it by audience and channel.</p>
    <div class="pill-row">
      <span class="pill ${!state.funnelId ? 'active' : ''}" data-funnel="">Default DTC funnel</span>
      ${funnels.map((f) => `<span class="pill ${state.funnelId === f.id ? 'active' : ''}" data-funnel="${esc(f.id)}">${esc(f.name)}</span>`).join('')}
      <span class="pill" id="new-funnel-toggle">+ New funnel</span>
    </div>
    <div class="inline-form" style="margin-bottom:16px">
      <div><label>Audience filter</label><select id="segment-filter"><option value="">All visitors</option>
        ${segs.map((s) => `<option value="${esc(s.id)}" ${state.segment === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
      <div><label>Channel filter (source)</label><select id="source-filter"><option value="">All channels</option>
        ${sources.map((s) => `<option value="${esc(s)}" ${state.source === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
    </div>
    <div class="card hidden" id="funnel-builder">
      <h3>New funnel</h3>
      <form id="funnel-form" class="panel-form">
        <div><label>Name</label><input name="name" placeholder="Quiz funnel" required></div>
        <div id="steps">${funnelStepRow(0)}${funnelStepRow(1)}</div>
        <div class="row-actions">
          <button type="button" class="secondary" id="add-step">+ Add step</button>
          <button type="submit">Create funnel</button>
        </div>
      </form>
    </div>
    <h2>${esc(funnel.name)}${state.segment || state.source ? ' <span class="muted">(filtered)</span>' : ''}</h2>
    <div class="card">
      ${funnel.stages.map((s, i) => `
        <div style="padding:12px 0 ${i === funnel.stages.length - 1 ? '0' : '12px'}">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong>${esc(s.label)}</strong>
            <span>
              <strong>${s.visitors.toLocaleString()}</strong>
              <span class="muted"> visitors</span>
              ${s.stepRate != null ? `<span class="badge ${s.stepRate >= 0.5 ? 'green' : s.stepRate >= 0.25 ? 'amber' : 'red'}" style="margin-left:8px">${pct(s.stepRate, 1)} of previous</span>` : ''}
              ${s.overallRate != null && i > 0 ? `<span class="badge gray" style="margin-left:4px">${pct(s.overallRate, 1)} overall</span>` : ''}
            </span>
          </div>
          <div class="bar-track" style="height:26px"><div class="bar-fill" style="width:${Math.max(1, (s.visitors / maxVisitors) * 100)}%"></div></div>
          ${s.dropOff ? `<div class="muted" style="font-size:12.5px;margin-top:4px">− ${s.dropOff.toLocaleString()} dropped</div>` : ''}
        </div>`).join('')}
    </div>
    ${funnel.leak ? `<div class="card mt" style="border-color:var(--amber)">
      🔍 <strong>Biggest leak:</strong> ${esc(funnel.leak.from)} → ${esc(funnel.leak.to)} loses ${pct(funnel.leak.loss, 1)} of visitors.
      This step is your highest-leverage experiment target — see <a class="back-link" href="#/insights">Insights</a> for the recommended play.</div>` : ''}
    ${state.funnelId ? `<div class="row-actions mt"><button class="danger small" id="del-funnel">Delete this funnel</button></div>` : ''}
  `;
  main.querySelectorAll('[data-funnel]').forEach((pill) =>
    pill.addEventListener('click', () => pages.funnel({ ...state, funnelId: pill.dataset.funnel || undefined }))
  );
  document.getElementById('segment-filter').addEventListener('change', (e) =>
    pages.funnel({ ...state, segment: e.target.value || undefined }));
  document.getElementById('source-filter').addEventListener('change', (e) =>
    pages.funnel({ ...state, source: e.target.value || undefined }));
  document.getElementById('new-funnel-toggle').addEventListener('click', () =>
    document.getElementById('funnel-builder').classList.toggle('hidden'));
  let stepCount = 2;
  document.getElementById('add-step').addEventListener('click', () => {
    document.getElementById('steps').insertAdjacentHTML('beforeend', funnelStepRow(stepCount++));
  });
  document.getElementById('funnel-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const steps = [];
    for (let i = 0; i < stepCount; i++) {
      if (fd.get(`s-label-${i}`) == null) continue;
      const type = fd.get(`s-type-${i}`);
      steps.push({
        label: fd.get(`s-label-${i}`), type,
        name: type === 'track' ? fd.get(`s-match-${i}`) : undefined,
        goal: type === 'conversion' ? fd.get(`s-match-${i}`) || undefined : undefined,
        urlContains: type === 'pageview' ? fd.get(`s-match-${i}`) || undefined : undefined,
      });
    }
    try {
      const created = await api('/api/funnels', { method: 'POST', body: { name: fd.get('name'), steps } });
      toast('Funnel created');
      pages.funnel({ funnelId: created.id });
    } catch (err) { toast(err.message, true); }
  });
  const delBtn = document.getElementById('del-funnel');
  if (delBtn) delBtn.addEventListener('click', async () => {
    if (!confirm('Delete this funnel? (Definition only — events are kept.)')) return;
    await api(`/api/funnels/${state.funnelId}`, { method: 'DELETE' });
    pages.funnel({});
  });
};

function funnelStepRow(i) {
  return `<div class="form-row" style="margin-bottom:8px">
    <div><label>Step ${i + 1} label</label><input name="s-label-${i}" placeholder="${i === 0 ? 'Visited site' : 'Step label'}" ${i < 2 ? 'required' : ''}></div>
    <div><label>Matches</label><select name="s-type-${i}">
      <option value="pageview">Pageview</option>
      <option value="track" ${i > 0 ? 'selected' : ''}>Tracked step</option>
      <option value="conversion">Conversion</option>
    </select></div>
    <div><label>Step name / goal / URL contains</label><input name="s-match-${i}" placeholder="add_to_cart · purchase · /products/"></div>
  </div>`;
}

// ---------- insights ----------

function insightCard(ins) {
  const style = {
    bad: ['var(--red)', '🔴'], warn: ['var(--amber)', '🟡'],
    good: ['var(--green)', '🟢'], info: ['var(--accent)', 'ℹ️'],
  }[ins.severity] || ['var(--border)', '•'];
  return `<div class="card" style="border-left:3px solid ${style[0]}">
    <h3>${style[1]} ${esc(ins.title)}</h3>
    <p class="muted" style="font-size:13.5px;line-height:1.55">${esc(ins.detail)}</p>
    ${ins.skill ? `<p class="muted mt" style="font-size:12.5px">Methodology: <code>skills/${esc(ins.skill)}</code></p>` : ''}
  </div>`;
}

pages.insights = async () => {
  const data = await api('/api/insights');
  main.innerHTML = `
    <h1>Insights</h1>
    <p class="page-sub">The full picture: ads spend, attribution, funnel behavior, tracking hygiene, and experiments cross-referenced into prioritized findings.</p>
    ${data.insights.length ? `<div class="grid cols-2">${data.insights.map(insightCard).join('')}</div>`
      : '<div class="empty">Not enough data yet — install the snippet, add campaign spend, and come back.</div>'}
  `;
};

// ---------- audiences (segments) ----------

const SEGMENT_ATTRS = [
  { id: 'device', label: 'Device', hint: 'mobile | desktop' },
  { id: 'returning', label: 'Returning visitor', hint: 'true | false' },
  { id: 'visits', label: 'Session count', hint: 'number' },
  { id: 'source', label: 'UTM source', hint: 'meta, google…' },
  { id: 'medium', label: 'UTM medium', hint: 'cpc, email…' },
  { id: 'campaign', label: 'UTM campaign', hint: 'prospecting-broad' },
  { id: 'referrer', label: 'Referrer', hint: 'URL substring' },
  { id: 'path', label: 'Page path', hint: '/products/' },
  { id: 'hour', label: 'Hour of day', hint: '0–23' },
  { id: 'day', label: 'Day of week', hint: '0=Sun … 6=Sat' },
];
const SEGMENT_OPS = ['is', 'is_not', 'contains', 'not_contains', 'gt', 'lt'];

function ruleRow(i) {
  return `<div class="form-row rule-row" data-rule="${i}">
    <div><label>Attribute</label><select name="r-attr-${i}">
      ${SEGMENT_ATTRS.map((a) => `<option value="${a.id}">${a.label}</option>`).join('')}
    </select></div>
    <div><label>Condition</label><select name="r-op-${i}">
      ${SEGMENT_OPS.map((o) => `<option value="${o}">${o.replace('_', ' ')}</option>`).join('')}
    </select></div>
    <div><label>Value</label><input name="r-value-${i}" placeholder="${esc(SEGMENT_ATTRS[0].hint)}" required></div>
  </div>`;
}

function describeRules(rules) {
  return rules.map((r) => `${r.attr} ${r.op.replace('_', ' ')} "${r.value}"`).join(' AND ');
}

pages.audiences = async () => {
  const segs = await api('/api/segments');
  main.innerHTML = `
    <h1>Audiences</h1>
    <p class="page-sub">Segments are evaluated in the visitor's browser (device, channel, behavior) and can target experiments and personalizations. All rules must match (AND).</p>
    <div class="card">
      <h3>New segment</h3>
      <form id="segment-form" class="panel-form">
        <div class="form-row">
          <div><label>Name</label><input name="name" placeholder="Mobile paid traffic" required></div>
          <div><label>Description (optional)</label><input name="description" placeholder="Mobile visitors arriving from paid channels"></div>
        </div>
        <div id="rules">${ruleRow(0)}</div>
        <div class="row-actions">
          <button type="button" class="secondary" id="add-rule">+ Add rule (AND)</button>
          <button type="submit">Create segment</button>
        </div>
      </form>
    </div>
    <h2>Your segments</h2>
    ${segs.length ? `<div class="card" style="padding:0"><table>
      <tr><th>Name</th><th>Rules</th><th>Visitors</th><th>Conv.</th><th>CVR</th><th>Revenue</th><th></th></tr>
      ${segs.map((s) => `<tr>
        <td><strong>${esc(s.name)}</strong>${s.description ? `<div class="muted" style="font-size:12px">${esc(s.description)}</div>` : ''}</td>
        <td class="muted" style="font-size:12.5px">${esc(describeRules(s.rules))}</td>
        <td>${s.stats.visitors.toLocaleString()}</td>
        <td>${s.stats.conversions.toLocaleString()}</td>
        <td>${pct(s.stats.cvr, 1)}</td>
        <td>${money(s.stats.revenue)}</td>
        <td><button class="danger small" data-del-segment="${esc(s.id)}">Delete</button></td>
      </tr>`).join('')}
    </table></div>` : '<div class="empty">No segments yet. Segment stats populate as tagged events arrive.</div>'}
  `;
  let ruleCount = 1;
  document.getElementById('add-rule').addEventListener('click', () => {
    document.getElementById('rules').insertAdjacentHTML('beforeend', ruleRow(ruleCount++));
  });
  document.getElementById('segment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rules = [];
    for (let i = 0; i < ruleCount; i++) {
      if (fd.get(`r-attr-${i}`) == null) continue;
      rules.push({ attr: fd.get(`r-attr-${i}`), op: fd.get(`r-op-${i}`), value: fd.get(`r-value-${i}`) });
    }
    try {
      await api('/api/segments', { method: 'POST', body: { name: fd.get('name'), description: fd.get('description'), rules } });
      toast('Segment created');
      render();
    } catch (err) { toast(err.message, true); }
  });
  main.querySelectorAll('[data-del-segment]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      try {
        await api(`/api/segments/${btn.dataset.delSegment}`, { method: 'DELETE' });
        toast('Segment deleted');
        render();
      } catch (err) { toast(err.message, true); }
    })
  );
};

// ---------- personalize (experiences) ----------

pages.personalize = async () => {
  const [pxs, segs, sites] = await Promise.all([
    api('/api/personalizations'), api('/api/segments'), api('/api/sites'),
  ]);
  const results = await Promise.all(pxs.map((p) => api(`/api/personalizations/${p.id}/results`)));
  main.innerHTML = `
    <h1>Personalize</h1>
    <p class="page-sub">Serve a targeted experience to an audience, keeping a holdback control so the lift is measured like an A/B test.</p>
    <div class="card">
      <h3>New experience</h3>
      ${sites.length ? `<form id="px-form" class="panel-form">
        <div class="form-row">
          <div><label>Name</label><input name="name" placeholder="Free-shipping bar for paid mobile traffic" required></div>
          <div><label>Site</label><select name="siteId">
            ${sites.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div><label>Audience</label><select name="segmentId"><option value="">All visitors</option>
            ${segs.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}</select></div>
          <div><label>Conversion goal</label><input name="goal" value="purchase" required></div>
          <div><label>Holdback % (control)</label><input name="holdback" type="number" min="0" max="50" value="10"></div>
          <div><label>Page targeting (URL contains)</label><input name="url" placeholder="/products/"></div>
        </div>
        <div class="variant-block">
          <div class="form-row">
            <div><label>DOM change selector</label><input name="selector" placeholder=".hero-title" required></div>
            <div><label>Change type</label><select name="type">
              <option value="text">Replace text</option><option value="html">Replace HTML</option>
              <option value="style">Append CSS</option><option value="hide">Hide element</option>
            </select></div>
            <div><label>New value</label><input name="value" placeholder="Free express shipping on every order today"></div>
          </div>
        </div>
        <div class="row-actions"><button type="submit">Create experience</button></div>
      </form>` : '<p class="muted">Add a site first on the <a class="back-link" href="#/sites">Sites page</a>.</p>'}
    </div>
    <h2>Experiences</h2>
    ${pxs.length ? pxs.map((p, idx) => personalizationCard(p, results[idx], segs)).join('')
      : '<div class="empty">No experiences yet.</div>'}
  `;
  const form = document.getElementById('px-form');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      await api('/api/personalizations', {
        method: 'POST',
        body: {
          name: fd.get('name'), siteId: fd.get('siteId'), segmentId: fd.get('segmentId') || undefined,
          goal: fd.get('goal'), url: fd.get('url'),
          holdback: fd.get('holdback') === '' ? undefined : Number(fd.get('holdback')),
          changes: [{ selector: fd.get('selector'), type: fd.get('type'), value: fd.get('value') || '' }],
        },
      });
      toast('Experience created — start it when ready');
      render();
    } catch (err) { toast(err.message, true); }
  });
  main.querySelectorAll('[data-px-status]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      await api(`/api/personalizations/${btn.dataset.pxId}/status`, { method: 'POST', body: { status: btn.dataset.pxStatus } });
      toast(`Experience ${btn.dataset.pxStatus}`);
      render();
    })
  );
  main.querySelectorAll('[data-del-px]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this experience?')) return;
      await api(`/api/personalizations/${btn.dataset.delPx}`, { method: 'DELETE' });
      render();
    })
  );
};

function personalizationCard(p, r, segs) {
  const seg = p.segmentId ? segs.find((s) => s.id === p.segmentId) : null;
  const [holdback, experience] = r.arms;
  const t = r.vsHoldback;
  return `<div class="card mt">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="margin-bottom:4px">${esc(p.name)} ${statusBadge(p.status)}</h3>
        <div class="muted" style="font-size:13px">
          Audience: <strong>${seg ? esc(seg.name) : 'All visitors'}</strong>
          · Goal: ${esc(p.goal)} · Holdback: ${p.holdback}%
          ${p.url ? ` · URLs containing <code>${esc(p.url)}</code>` : ''}
        </div>
      </div>
      <div class="row-actions">
        ${p.status !== 'running' ? `<button class="small" data-px-status="running" data-px-id="${esc(p.id)}">▶ Start</button>` : ''}
        ${p.status === 'running' ? `<button class="secondary small" data-px-status="stopped" data-px-id="${esc(p.id)}">■ Stop</button>` : ''}
        <button class="danger small" data-del-px="${esc(p.id)}">Delete</button>
      </div>
    </div>
    <table class="mt">
      <tr><th>Arm</th><th>Visitors</th><th>Conversions</th><th>Rate</th><th>Revenue</th><th>Lift</th><th>Significance</th></tr>
      <tr><td><strong>Holdback (control)</strong></td><td>${holdback.visitors.toLocaleString()}</td>
        <td>${holdback.conversions.toLocaleString()}</td><td>${pct(holdback.rate)}</td><td>${money(holdback.revenue)}</td><td>—</td><td>—</td></tr>
      <tr><td><strong>Experience</strong></td><td>${experience.visitors.toLocaleString()}</td>
        <td>${experience.conversions.toLocaleString()}</td><td>${pct(experience.rate)}</td><td>${money(experience.revenue)}</td>
        <td>${t ? upliftCell(t) : '—'}</td><td>${t ? sigCell(t) : '—'}</td></tr>
    </table>
    <pre class="code mt" style="font-size:12px">${esc(JSON.stringify(p.changes))}</pre>
  </div>`;
}

// ---------- GA4 reports ----------

pages.reports = async (state = {}) => {
  const [sites, meta] = await Promise.all([api('/api/sites'), api('/api/ga4/meta')]);
  const siteId = state.siteId || (sites[0] && sites[0].id);
  const site = sites.find((s) => s.id === siteId);
  const connected = site && site.ga4 && site.ga4.connected;
  const saved = siteId ? await api(`/api/reports?siteId=${siteId}`) : [];

  main.innerHTML = `
    <h1>GA4 Reports</h1>
    <p class="page-sub">Connect Google Analytics 4 to blend its data with what the snippet tracks — and build reports without leaving the platform.</p>
    ${sites.length > 1 ? `<div class="pill-row">${sites.map((s) =>
      `<span class="pill ${s.id === siteId ? 'active' : ''}" data-site="${esc(s.id)}">${esc(s.name)}</span>`).join('')}</div>` : ''}
    ${!site ? '<div class="empty">Add a site first on the <a class="back-link" href="#/sites">Sites page</a>.</div>' : connected ? `
      <div class="card">
        <h3>Connected ✓</h3>
        <p class="muted">Property <code>${esc(site.ga4.propertyId)}</code> via <code>${esc(site.ga4.clientEmail)}</code>
          <button class="danger small" id="ga4-disconnect" style="margin-left:10px">Disconnect</button></p>
      </div>
      <div class="pill-row mt">
        ${['overview', 'channels', 'pages', 'trend'].map((t) =>
          `<span class="pill ${state.type === t || (!state.type && t === 'overview') ? 'active' : ''}" data-report-type="${t}">${t}</span>`).join('')}
        <span class="pill" data-report-type="compare">platform vs GA4</span>
      </div>
      <div id="report-output"><div class="loading">Loading report…</div></div>
      <h2>Custom report builder</h2>
      <div class="card">
        <form id="report-builder" class="panel-form">
          <div class="form-row">
            <div><label>Report name</label><input name="name" placeholder="Revenue by landing page" required></div>
            <div><label>Days</label><input name="days" type="number" min="1" max="365" value="28"></div>
          </div>
          <div class="form-row">
            <div><label>Dimensions (up to 2)</label><select name="dim1"><option value="">—</option>
              ${meta.dimensions.map((d) => `<option>${d}</option>`).join('')}</select></div>
            <div><label>&nbsp;</label><select name="dim2"><option value="">—</option>
              ${meta.dimensions.map((d) => `<option>${d}</option>`).join('')}</select></div>
          </div>
          <div><label>Metrics</label>
            <div class="pill-row">${meta.metrics.map((m) =>
              `<label class="pill" style="cursor:pointer"><input type="checkbox" name="metric" value="${m}" style="width:auto;margin-right:5px">${m}</label>`).join('')}</div>
          </div>
          <div class="row-actions"><button type="submit">Save &amp; run</button></div>
        </form>
      </div>
      ${saved.length ? `<h2>Saved reports</h2><div class="card" style="padding:0"><table>
        <tr><th>Name</th><th>Dimensions</th><th>Metrics</th><th>Days</th><th></th></tr>
        ${saved.map((r) => `<tr>
          <td><strong>${esc(r.name)}</strong></td>
          <td class="muted">${esc(r.dimensions.join(', ') || '—')}</td>
          <td class="muted">${esc(r.metrics.join(', '))}</td>
          <td>${r.days}</td>
          <td class="row-actions">
            <button class="small" data-run-report="${esc(r.id)}">Run</button>
            <button class="danger small" data-del-report="${esc(r.id)}">Delete</button>
          </td>
        </tr>`).join('')}
      </table></div><div id="saved-output"></div>` : ''}
    ` : `
      <div class="card">
        <h3>Connect GA4 for ${esc(site.name)}</h3>
        <ol class="muted" style="margin:10px 0 16px 18px;line-height:1.8">
          <li>Google Cloud console → create a <strong>service account</strong> and download its JSON key.</li>
          <li>Enable the <strong>Google Analytics Data API</strong> on that project.</li>
          <li>GA4 Admin → Property access management → add the service account email as <strong>Viewer</strong>.</li>
          <li>Paste the numeric property id and the JSON key below. Credentials are verified with a live test query.</li>
        </ol>
        <form id="ga4-form" class="panel-form">
          <div><label>GA4 property id (numeric)</label><input name="propertyId" placeholder="123456789" required></div>
          <div><label>Service account JSON key</label><textarea name="serviceAccountJson" rows="6" placeholder='{"type": "service_account", "client_email": "...", "private_key": "..."}' required></textarea></div>
          <div class="row-actions"><button type="submit" id="ga4-connect-btn">Connect &amp; verify</button></div>
        </form>
      </div>`}
  `;
  main.querySelectorAll('[data-site]').forEach((pill) =>
    pill.addEventListener('click', () => pages.reports({ siteId: pill.dataset.site })));

  const ga4Form = document.getElementById('ga4-form');
  if (ga4Form) ga4Form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('ga4-connect-btn');
    btn.disabled = true; btn.textContent = 'Verifying…';
    const fd = new FormData(ga4Form);
    try {
      await api(`/api/sites/${siteId}/ga4`, {
        method: 'POST',
        body: { propertyId: fd.get('propertyId'), serviceAccountJson: fd.get('serviceAccountJson') },
      });
      toast('GA4 connected');
      pages.reports({ siteId });
    } catch (err) {
      toast(err.message, true);
      btn.disabled = false; btn.textContent = 'Connect & verify';
    }
  });

  if (!connected) return;

  document.getElementById('ga4-disconnect').addEventListener('click', async () => {
    if (!confirm('Disconnect GA4 for this site?')) return;
    await api(`/api/sites/${siteId}/ga4`, { method: 'DELETE' });
    pages.reports({ siteId });
  });

  async function loadReport(type) {
    const out = document.getElementById('report-output');
    out.innerHTML = '<div class="loading">Loading report…</div>';
    try {
      if (type === 'compare') {
        const c = await api(`/api/ga4/${siteId}/compare`);
        out.innerHTML = `<div class="grid cols-3">
          ${metric('Platform visitors', c.platform.visitors.toLocaleString(), `GA4 users: ${c.ga4.users.toLocaleString()}`)}
          ${metric('Platform conversions', c.platform.conversions.toLocaleString(), `GA4: ${c.ga4.conversions.toLocaleString()}`)}
          ${metric('Platform revenue', money(c.platform.revenue), `GA4: ${money(c.ga4.revenue)}`)}
        </div>
        <div class="card mt">${c.visitorDiffPct == null ? '' : `<strong>Visitor gap: ${c.visitorDiffPct > 0 ? '+' : ''}${c.visitorDiffPct}%</strong> · `}<span class="muted">${esc(c.note)}</span></div>`;
        return;
      }
      const r = await api(`/api/ga4/${siteId}/report?type=${type}`);
      out.innerHTML = ga4Table(r);
    } catch (err) {
      out.innerHTML = `<div class="empty">${esc(err.message)}</div>`;
    }
  }
  main.querySelectorAll('[data-report-type]').forEach((pill) =>
    pill.addEventListener('click', () => {
      main.querySelectorAll('[data-report-type]').forEach((p) => p.classList.toggle('active', p === pill));
      loadReport(pill.dataset.reportType);
    }));
  loadReport(state.type || 'overview');

  const builder = document.getElementById('report-builder');
  if (builder) builder.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(builder);
    const dimensions = [fd.get('dim1'), fd.get('dim2')].filter(Boolean);
    const metrics = [...builder.querySelectorAll('input[name=metric]:checked')].map((c) => c.value);
    try {
      const saved2 = await api('/api/reports', {
        method: 'POST',
        body: { name: fd.get('name'), siteId, dimensions, metrics, days: Number(fd.get('days')) || 28 },
      });
      toast('Report saved');
      const result = await api(`/api/reports/${saved2.id}/run`);
      pages.reports({ siteId });
      setTimeout(() => {
        const out = document.getElementById('saved-output');
        if (out) out.innerHTML = ga4Table(result);
      }, 50);
    } catch (err) { toast(err.message, true); }
  });
  main.querySelectorAll('[data-run-report]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const out = document.getElementById('saved-output');
      out.innerHTML = '<div class="loading">Running…</div>';
      try {
        out.innerHTML = ga4Table(await api(`/api/reports/${btn.dataset.runReport}/run`));
      } catch (err) { out.innerHTML = `<div class="empty">${esc(err.message)}</div>`; }
    }));
  main.querySelectorAll('[data-del-report]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      await api(`/api/reports/${btn.dataset.delReport}`, { method: 'DELETE' });
      pages.reports({ siteId });
    }));
};

function ga4Table(r) {
  if (!r.rows.length) return '<div class="empty">GA4 returned no rows for this range.</div>';
  const cols = [...r.dimensions, ...r.metrics];
  return `<div class="card" style="padding:0;overflow-x:auto"><table>
    <tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>
    ${r.rows.map((row) => `<tr>${cols.map((c) =>
      `<td>${typeof row[c] === 'number' ? row[c].toLocaleString() : esc(row[c])}</td>`).join('')}</tr>`).join('')}
  </table></div>
  <p class="muted mt">Last ${r.days} days · ${r.rows.length} rows</p>`;
}

// ---------- website performance ----------

pages.performance = async () => {
  const report = await api('/api/performance');
  const vitalCell = (v) => {
    if (!v) return '—';
    const cls = { good: 'green', 'needs-improvement': 'amber', poor: 'red' }[v.rating] || 'gray';
    return `<span class="badge ${cls}">${v.p75.toLocaleString()}</span>`;
  };
  main.innerHTML = `
    <h1>Website Performance</h1>
    <p class="page-sub">Real-user Core Web Vitals collected by the snippet (p75). Slow pages cost conversions — targets: LCP &lt; 2500ms, CLS &lt; 0.1, INP &lt; 200ms, TTFB &lt; 800ms.</p>
    ${report.site.samples ? `
      <div class="grid cols-4">
        ${report.metrics.map((m) => {
          const v = report.site[m];
          return `<div class="card"><div class="metric-label">${m} · p75</div>
            <div class="metric-value">${v ? v.p75.toLocaleString() : '—'}${m === 'CLS' ? '' : '<small> ms</small>'}</div>
            <div class="mt">${v ? `<span class="badge ${{ good: 'green', 'needs-improvement': 'amber', poor: 'red' }[v.rating]}">${v.rating}</span>` : ''}</div></div>`;
        }).join('')}
      </div>
      <h2>By page</h2>
      <div class="card" style="padding:0"><table>
        <tr><th>Page</th><th>Samples</th><th>LCP (ms)</th><th>CLS</th><th>INP (ms)</th><th>TTFB (ms)</th></tr>
        ${report.pages.map((p) => `<tr>
          <td><strong>${esc(p.page)}</strong></td><td>${p.samples.toLocaleString()}</td>
          <td>${vitalCell(p.LCP)}</td><td>${vitalCell(p.CLS)}</td><td>${vitalCell(p.INP)}</td><td>${vitalCell(p.TTFB)}</td>
        </tr>`).join('')}
      </table></div>`
      : '<div class="empty">No vitals collected yet — they arrive automatically once the snippet is installed and visitors browse your site.</div>'}
  `;
};

// ---------- install ----------

pages.install = async () => {
  const sites = await api('/api/sites');
  const origin = location.origin;
  const first = sites[0];
  main.innerHTML = `
    <h1>Install the snippet</h1>
    <p class="page-sub">One script tag adds visitor tracking, experiment bucketing, and conversion events to any storefront.</p>
    <div class="card">
      <h3>1. Add to your site's &lt;head&gt;</h3>
      <pre class="code">&lt;script src="${esc(origin)}/t/snippet.js?site=${esc(first ? first.id : 'YOUR_SITE_ID')}" async&gt;&lt;/script&gt;</pre>
      ${first ? `<p class="muted">Using site ID for <strong>${esc(first.name)}</strong>. Find other site IDs on the Sites page.</p>` : '<p class="muted">Add a site first to get a real site ID.</p>'}
    </div>
    <div class="card mt">
      <h3>2. Track funnel steps</h3>
      <p class="muted" style="margin-bottom:10px">Markup or JS — these power the Funnel page:</p>
      <pre class="code">&lt;button data-cro-track="add_to_cart"&gt;Add to Cart&lt;/button&gt;

window.CRO.track('begin_checkout');</pre>
    </div>
    <div class="card mt">
      <h3>3. Track conversions with revenue</h3>
      <p class="muted" style="margin-bottom:10px">Pass the order value so ROAS can be computed per channel:</p>
      <pre class="code">&lt;button data-cro-convert="purchase" data-cro-value="48"&gt;Complete order&lt;/button&gt;

window.CRO.convert('purchase', { value: orderTotal }); // e.g. on the thank-you page</pre>
    </div>
    <div class="card mt">
      <h3>4. Tag your ads</h3>
      <p class="muted" style="line-height:1.6">The snippet automatically captures <code>utm_source / utm_medium / utm_campaign / utm_content / utm_term</code>, plus <code>gclid</code>/<code>fbclid</code>/<code>ttclid</code> click IDs and referrers — as both first touch (persisted) and last touch (per session). Use the UTM builder on the <a class="back-link" href="#/channels">Ads &amp; Channels</a> page and make the values match your campaign spend entries exactly.</p>
    </div>
    <div class="card mt">
      <h3>5. Read the assigned variant (optional)</h3>
      <pre class="code">window.CRO.variant('Hero headline test'); // "Control" | "Variant B" | null</pre>
      <p class="muted mt">Variants with DOM changes are applied automatically — no code needed.</p>
    </div>
    <div class="card mt">
      <h3>How assignment works</h3>
      <p class="muted" style="line-height:1.6">Each visitor gets a stable anonymous ID. Bucketing hashes <code>experimentId:visitorId</code> (FNV-1a), so the same visitor always sees the same variant — across page loads and devices sharing the ID — with traffic split by variant weights. Events are batched and sent via <code>sendBeacon</code>.</p>
    </div>
  `;
};

// ------------------------------------------------------------------ router

function bindRowLinks() {
  main.querySelectorAll('tr.clickable').forEach((tr) =>
    tr.addEventListener('click', () => { location.hash = tr.dataset.href; })
  );
}

async function render() {
  if (!(await ensureAuth())) return;
  const hash = location.hash.replace(/^#\//, '') || 'dashboard';
  const [page, id] = hash.split('/');
  document.querySelectorAll('#nav a').forEach((a) =>
    a.classList.toggle('active', a.dataset.route === page)
  );
  try {
    if (page === 'experiments' && id) await pages.experimentDetail(id);
    else if (page === 'audits' && id) await pages.auditDetail(id);
    else if (pages[page]) await pages[page]();
    else await pages.dashboard();
  } catch (err) {
    main.innerHTML = `<div class="empty">Failed to load: ${esc(err.message)}</div>`;
  }
}

window.addEventListener('hashchange', render);
render();
