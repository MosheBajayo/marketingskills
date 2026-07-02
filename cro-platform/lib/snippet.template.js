/* CRO Platform snippet — embed on your storefront:
 *   <script src="https://YOUR_PLATFORM_HOST/t/snippet.js?site=YOUR_SITE_ID" async></script>
 *
 * What it does:
 *  - Assigns each visitor a stable anonymous id (localStorage).
 *  - Captures UTM parameters + referrer as first touch (persisted) and
 *    last touch (per session) so every event carries ad attribution.
 *  - Evaluates audience segments client-side (device, new vs returning,
 *    channel, path, time) and tags every event with the matched segments.
 *  - Fetches running experiments and deterministically buckets the visitor;
 *    experiments with an audience only run for visitors in that segment.
 *  - Applies personalization experiences to matching segments, holding back
 *    a control share so the lift is measurable.
 *  - Applies variant DOM changes (text / html / style / hide) before paint settles.
 *  - Sends pageview + assignment + personalization events; exposes:
 *      window.CRO.track(name)                 — funnel steps (add_to_cart, begin_checkout…)
 *      window.CRO.convert(goal, {value: 48})  — conversions with optional revenue
 *      window.CRO.segments                    — matched segment ids
 *  - Auto-tracks clicks on [data-cro-track="step"] and [data-cro-convert="goal"].
 */
(function () {
  'use strict';
  var SITE_ID = __SITE_ID__;
  var script = document.currentScript;
  var BASE = script ? script.src.split('/t/snippet.js')[0] : '';

  function visitorId() {
    try {
      var id = localStorage.getItem('_cro_vid');
      if (!id) {
        id = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('_cro_vid', id);
      }
      return id;
    } catch (e) {
      return 'v_session_' + Math.random().toString(36).slice(2, 10);
    }
  }

  // ---- attribution: first + last touch -------------------------------
  function parseTouch() {
    var touch = { referrer: document.referrer || '', landing: location.pathname };
    var found = false;
    try {
      var q = new URLSearchParams(location.search);
      ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (k) {
        var v = q.get('utm_' + k);
        if (v) { touch[k] = v; found = true; }
      });
      // Ad click ids imply paid even without full UTMs.
      if (!found && (q.get('gclid') || q.get('fbclid') || q.get('ttclid'))) {
        touch.source = q.get('gclid') ? 'google' : q.get('fbclid') ? 'facebook' : 'tiktok';
        touch.medium = 'cpc';
        found = true;
      }
    } catch (e) { /* URLSearchParams unavailable */ }
    var external = touch.referrer && touch.referrer.indexOf('//' + location.host) === -1;
    return (found || external) ? touch : null;
  }

  function getTouches() {
    var current = parseTouch();
    var ft = null, lt = null;
    try {
      ft = JSON.parse(localStorage.getItem('_cro_ft') || 'null');
      if (!ft) {
        ft = current || { referrer: '', landing: location.pathname };
        localStorage.setItem('_cro_ft', JSON.stringify(ft));
      }
      lt = JSON.parse(sessionStorage.getItem('_cro_lt') || 'null');
      if (current || !lt) {
        lt = current || lt || ft;
        sessionStorage.setItem('_cro_lt', JSON.stringify(lt));
      }
    } catch (e) {
      ft = ft || current; lt = current || ft;
    }
    return { ft: ft, lt: lt };
  }

  // ---- audience segmentation (rules evaluated client-side) -----------
  function visitorAttrs() {
    var visits = 1;
    try {
      if (!sessionStorage.getItem('_cro_session')) {
        sessionStorage.setItem('_cro_session', '1');
        visits = 1 + Number(localStorage.getItem('_cro_visits') || 0);
        localStorage.setItem('_cro_visits', String(visits));
      } else {
        visits = Number(localStorage.getItem('_cro_visits') || 1);
      }
    } catch (e) { /* storage unavailable */ }
    var now = new Date();
    var lt = TOUCHES.lt || {};
    return {
      device: (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
        /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      returning: visits > 1,
      visits: visits,
      source: lt.source || '',
      medium: lt.medium || '',
      campaign: lt.campaign || '',
      referrer: document.referrer || '',
      path: location.pathname,
      hour: now.getHours(),
      day: now.getDay(),
    };
  }

  // Mirrors lib/segments.js ruleMatches — keep in sync.
  function ruleMatches(rule, attrs) {
    var raw = attrs[rule.attr];
    var actual = raw == null ? '' : String(raw).toLowerCase();
    var expected = String(rule.value).toLowerCase();
    switch (rule.op) {
      case 'is': return actual === expected;
      case 'is_not': return actual !== expected;
      case 'contains': return actual.indexOf(expected) !== -1;
      case 'not_contains': return actual.indexOf(expected) === -1;
      case 'gt': return Number(raw) > Number(rule.value);
      case 'lt': return Number(raw) < Number(rule.value);
      default: return false;
    }
  }

  function matchSegments(segs, attrs) {
    var matched = [];
    (segs || []).forEach(function (s) {
      var ok = true;
      for (var i = 0; i < s.rules.length; i++) {
        if (!ruleMatches(s.rules[i], attrs)) { ok = false; break; }
      }
      if (ok) matched.push(s.id);
    });
    return matched;
  }

  // FNV-1a — must match lib/experiments.js server-side bucketing.
  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function pickVariant(exp, vid) {
    var total = 0;
    for (var i = 0; i < exp.variants.length; i++) total += exp.variants[i].weight || 1;
    var bucket = ((fnv1a(exp.id + ':' + vid) % 10000) / 10000) * total;
    var acc = 0;
    for (var j = 0; j < exp.variants.length; j++) {
      acc += exp.variants[j].weight || 1;
      if (bucket < acc) return exp.variants[j];
    }
    return exp.variants[exp.variants.length - 1];
  }

  function applyChanges(variant) {
    (variant.changes || []).forEach(function (change) {
      try {
        var nodes = document.querySelectorAll(change.selector);
        nodes.forEach(function (node) {
          if (change.type === 'text') node.textContent = change.value;
          else if (change.type === 'html') node.innerHTML = change.value;
          else if (change.type === 'style') node.style.cssText += ';' + change.value;
          else if (change.type === 'hide') node.style.display = 'none';
        });
      } catch (e) { /* bad selector — skip */ }
    });
  }

  var queue = [];
  var flushTimer = null;
  function track(event) {
    event.siteId = SITE_ID;
    event.visitorId = VID;
    event.url = location.href;
    event.ft = TOUCHES.ft;
    event.lt = TOUCHES.lt;
    event.segments = MATCHED;
    queue.push(event);
    if (!flushTimer) flushTimer = setTimeout(flush, 400);
  }
  function flush() {
    flushTimer = null;
    if (!queue.length) return;
    var payload = JSON.stringify({ events: queue.splice(0, 50) });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(BASE + '/t/collect', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(BASE + '/t/collect', { method: 'POST', body: payload, keepalive: true, headers: { 'content-type': 'application/json' } });
    }
  }

  var VID = visitorId();
  var TOUCHES = getTouches();
  var ATTRS = visitorAttrs();
  var MATCHED = []; // segment ids matched for this visitor (filled from config)
  var assignments = {}; // experiment name -> variant
  var experiences = {}; // personalization name -> group

  window.CRO = {
    visitorId: VID,
    assignments: assignments,
    experiences: experiences,
    segments: MATCHED,
    attrs: ATTRS,
    touches: TOUCHES,
    variant: function (experimentName) {
      return assignments[experimentName] ? assignments[experimentName].name : null;
    },
    // Funnel step, e.g. CRO.track('add_to_cart')
    track: function (name) {
      if (name) track({ type: 'track', name: String(name) });
    },
    // Conversion with optional revenue: CRO.convert('purchase', {value: 48})
    convert: function (goal, opts) {
      var value = opts && typeof opts.value === 'number' ? opts.value : null;
      for (var name in assignments) {
        var a = assignments[name];
        track({ type: 'conversion', experimentId: a.experimentId, variantId: a.id, goal: goal || a.goal, value: value });
      }
      if (!Object.keys(assignments).length) track({ type: 'conversion', goal: goal || 'conversion', value: value });
      flush();
    },
  };

  fetch(BASE + '/t/config?site=' + encodeURIComponent(SITE_ID))
    .then(function (r) { return r.json(); })
    .then(function (cfg) {
      // Evaluate segments first — experiments and personalizations target them,
      // and every event (including this pageview) carries the matched ids.
      matchSegments(cfg.segments, ATTRS).forEach(function (id) { MATCHED.push(id); });
      track({ type: 'pageview' });

      (cfg.experiments || []).forEach(function (exp) {
        // Optional page targeting: only run when exp.url is a substring of the location.
        if (exp.url && location.href.indexOf(exp.url) === -1) return;
        // Audience targeting: only bucket visitors in the experiment's segment.
        if (exp.segmentId && MATCHED.indexOf(exp.segmentId) === -1) return;
        var variant = pickVariant(exp, VID);
        assignments[exp.name] = { id: variant.id, name: variant.name, experimentId: exp.id, goal: exp.goal };
        applyChanges(variant);
        track({ type: 'assignment', experimentId: exp.id, variantId: variant.id });
      });

      (cfg.personalizations || []).forEach(function (px) {
        if (px.url && location.href.indexOf(px.url) === -1) return;
        if (px.segmentId && MATCHED.indexOf(px.segmentId) === -1) return;
        // Deterministic holdback: a slice of the audience keeps the default
        // experience as the control arm. Must match lib/personalization.js.
        var group = (fnv1a('px:' + px.id + ':' + VID) % 100) < (px.holdback || 0) ? 'holdback' : 'experience';
        experiences[px.name] = group;
        if (group === 'experience') applyChanges(px);
        track({ type: 'personalization', personalizationId: px.id, group: group });
      });
    })
    .catch(function () {
      // Platform unreachable — fail open: no changes, still log the view.
      track({ type: 'pageview' });
    });

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    var stepEl = e.target.closest('[data-cro-track]');
    if (stepEl) window.CRO.track(stepEl.getAttribute('data-cro-track'));
    var convEl = e.target.closest('[data-cro-convert]');
    if (convEl) {
      var value = parseFloat(convEl.getAttribute('data-cro-value'));
      window.CRO.convert(convEl.getAttribute('data-cro-convert') || undefined, isNaN(value) ? undefined : { value: value });
    }
  });

  window.addEventListener('pagehide', flush);
})();
