/* CRO Platform snippet — embed on your storefront:
 *   <script src="https://YOUR_PLATFORM_HOST/t/snippet.js?site=YOUR_SITE_ID" async></script>
 *
 * What it does:
 *  - Assigns each visitor a stable anonymous id (localStorage).
 *  - Fetches running experiments and deterministically buckets the visitor.
 *  - Applies variant DOM changes (text / html / style / hide) before paint settles.
 *  - Sends pageview + assignment events; exposes window.CRO.convert(goal).
 *  - Auto-tracks clicks on any element with a data-cro-convert="goal" attribute.
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
  var assignments = {}; // experiment name -> variant

  window.CRO = {
    visitorId: VID,
    assignments: assignments,
    variant: function (experimentName) {
      return assignments[experimentName] ? assignments[experimentName].name : null;
    },
    convert: function (goal) {
      for (var name in assignments) {
        var a = assignments[name];
        track({ type: 'conversion', experimentId: a.experimentId, variantId: a.id, goal: goal || a.goal });
      }
      if (!Object.keys(assignments).length) track({ type: 'conversion', goal: goal || 'conversion' });
      flush();
    },
  };

  track({ type: 'pageview' });

  fetch(BASE + '/t/config?site=' + encodeURIComponent(SITE_ID))
    .then(function (r) { return r.json(); })
    .then(function (cfg) {
      (cfg.experiments || []).forEach(function (exp) {
        // Optional page targeting: only run when exp.url is a substring of the location.
        if (exp.url && location.href.indexOf(exp.url) === -1) return;
        var variant = pickVariant(exp, VID);
        assignments[exp.name] = { id: variant.id, name: variant.name, experimentId: exp.id, goal: exp.goal };
        applyChanges(variant);
        track({ type: 'assignment', experimentId: exp.id, variantId: variant.id });
      });
    })
    .catch(function () { /* platform unreachable — fail open, no changes applied */ });

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-cro-convert]') : null;
    if (el) window.CRO.convert(el.getAttribute('data-cro-convert') || undefined);
  });

  window.addEventListener('pagehide', flush);
})();
