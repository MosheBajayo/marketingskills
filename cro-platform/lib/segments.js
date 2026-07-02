// Audience segmentation engine (Dynamic Yield-style). A segment is a set
// of AND-ed rules over visitor attributes. The same rule contract is
// evaluated server-side (here) and client-side (snippet.template.js) —
// keep both implementations in sync.
//
// Visitor attributes:
//   device     'mobile' | 'desktop'
//   returning  boolean — visitor has a prior session
//   visits     number — session count
//   source, medium, campaign — last-touch UTM values (lowercase)
//   referrer   string
//   path       string — current pathname
//   hour       0-23 local, day 0-6 (0 = Sunday)
'use strict';

const ATTRIBUTES = ['device', 'returning', 'visits', 'source', 'medium', 'campaign', 'referrer', 'path', 'hour', 'day'];
const OPS = ['is', 'is_not', 'contains', 'not_contains', 'gt', 'lt'];

function validateSegment(body) {
  const errors = [];
  if (!body.name) errors.push('name is required');
  if (!Array.isArray(body.rules) || body.rules.length === 0) {
    errors.push('at least one rule is required');
  } else {
    body.rules.forEach((r, i) => {
      if (!ATTRIBUTES.includes(r.attr)) errors.push(`rules[${i}].attr must be one of ${ATTRIBUTES.join(', ')}`);
      if (!OPS.includes(r.op)) errors.push(`rules[${i}].op must be one of ${OPS.join(', ')}`);
      if (r.value == null || r.value === '') errors.push(`rules[${i}].value is required`);
    });
  }
  return errors;
}

function normalizeSegment(body) {
  return {
    name: String(body.name).trim(),
    siteId: body.siteId || null,
    description: body.description || '',
    rules: body.rules.map((r) => ({
      attr: r.attr,
      op: r.op,
      value: String(r.value).trim(),
    })),
  };
}

// Evaluate one rule against visitor attributes. Comparison is
// case-insensitive for strings; gt/lt coerce to numbers.
function ruleMatches(rule, attrs) {
  const raw = attrs[rule.attr];
  const actual = raw == null ? '' : String(raw).toLowerCase();
  const expected = String(rule.value).toLowerCase();
  switch (rule.op) {
    case 'is': return actual === expected;
    case 'is_not': return actual !== expected;
    case 'contains': return actual.includes(expected);
    case 'not_contains': return !actual.includes(expected);
    case 'gt': return Number(raw) > Number(rule.value);
    case 'lt': return Number(raw) < Number(rule.value);
    default: return false;
  }
}

// All rules must match (AND).
function evaluateSegment(segment, attrs) {
  return segment.rules.every((r) => ruleMatches(r, attrs || {}));
}

function matchedSegmentIds(segments, attrs) {
  return segments.filter((s) => evaluateSegment(s, attrs)).map((s) => s.id);
}

// Per-segment analytics computed from events (events carry the segment
// ids the snippet matched at collection time).
function segmentStats(segment, events) {
  const visitors = new Set();
  const converters = new Set();
  let revenue = 0;
  for (const e of events) {
    if (!Array.isArray(e.segments) || !e.segments.includes(segment.id)) continue;
    visitors.add(e.visitorId);
    if (e.type === 'conversion') {
      converters.add(e.visitorId);
      if (typeof e.value === 'number') revenue += e.value;
    }
  }
  return {
    visitors: visitors.size,
    conversions: converters.size,
    cvr: visitors.size ? converters.size / visitors.size : null,
    revenue: Math.round(revenue * 100) / 100,
  };
}

// Restrict an event list to visitors who matched a segment on any event.
function filterEventsBySegment(events, segmentId) {
  const members = new Set();
  for (const e of events) {
    if (Array.isArray(e.segments) && e.segments.includes(segmentId)) members.add(e.visitorId);
  }
  return events.filter((e) => members.has(e.visitorId));
}

module.exports = {
  ATTRIBUTES, OPS,
  validateSegment, normalizeSegment,
  ruleMatches, evaluateSegment, matchedSegmentIds,
  segmentStats, filterEventsBySegment,
};
