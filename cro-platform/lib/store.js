// Simple JSON-file persistence layer. Zero dependencies.
// Collections: sites, experiments, events, audits, campaigns.
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const COLLECTIONS = ['sites', 'experiments', 'events', 'audits', 'campaigns'];

class Store {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {};
    for (const c of COLLECTIONS) this.data[c] = [];
    this._load();
  }

  _load() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      for (const c of COLLECTIONS) {
        if (Array.isArray(parsed[c])) this.data[c] = parsed[c];
      }
    } catch {
      // Missing or corrupt file: start fresh.
    }
  }

  save() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const tmp = this.filePath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.filePath);
  }

  all(collection) {
    return this.data[collection];
  }

  find(collection, predicate) {
    return this.data[collection].filter(predicate);
  }

  get(collection, id) {
    return this.data[collection].find((item) => item.id === id) || null;
  }

  insert(collection, item) {
    if (!item.id) item.id = generateId(collection.slice(0, 3));
    item.createdAt = item.createdAt || new Date().toISOString();
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, id, patch) {
    const item = this.get(collection, id);
    if (!item) return null;
    Object.assign(item, patch, { updatedAt: new Date().toISOString() });
    this.save();
    return item;
  }

  remove(collection, id) {
    const before = this.data[collection].length;
    this.data[collection] = this.data[collection].filter((i) => i.id !== id);
    const removed = this.data[collection].length < before;
    if (removed) this.save();
    return removed;
  }
}

let counter = 0;
function generateId(prefix) {
  counter = (counter + 1) % 1296;
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${counter.toString(36)}${rand}`;
}

module.exports = { Store, generateId, COLLECTIONS };
