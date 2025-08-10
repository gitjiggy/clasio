const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { encrypt } = require('./encryption');

const DATA_PATH = path.join(__dirname, '..', 'data.json');

const defaultState = {
  users: [],
  oauth_accounts: [],
  portfolios: [],
  holdings: [],
  transactions: [],
  watchlists: [],
  watchlist_items: [],
  alerts: [],
  audit_log: [],
  feature_flags: {},
  content_blocks: {}
};

function readState() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { ...defaultState };
  }
}

function writeState(state) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function id() {
  return crypto.randomUUID();
}

function appendAudit(userId, action, entity, entityId, meta) {
  const state = readState();
  const prev = state.audit_log[state.audit_log.length - 1];
  const ts = new Date().toISOString();
  const record = { id: id(), user_id: userId || null, action, entity, entity_id: entityId || null, meta_json: meta || {}, ts };
  const base = JSON.stringify({ ...record, prev_hash: prev?.hash || null });
  const hash = crypto.createHash('sha256').update(base).digest('hex');
  const chained = { ...record, prev_hash: prev?.hash || null, hash };
  state.audit_log.push(chained);
  writeState(state);
  return chained;
}

module.exports = { readState, writeState, appendAudit, id };
