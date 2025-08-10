const { createHash } = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function computeHash(prevHash, record) {
  const base = JSON.stringify({ ...record, prev_hash: prevHash || null });
  return createHash('sha256').update(String(prevHash || '') + base).digest('hex');
}

async function writeAudit({ userId = null, action, entity = null, entityId = null, meta = null }) {
  const last = await prisma.audit_log.findFirst({ orderBy: { ts: 'desc' } });
  const prevHash = last?.hash || null;
  const metaString = meta ? JSON.stringify(meta) : null;
  const hash = computeHash(prevHash, { user_id: userId, action, entity, entity_id: entityId, meta_json: metaString });
  return prisma.audit_log.create({ data: { user_id: userId, action, entity, entity_id: entityId, meta_json: metaString, prev_hash: prevHash, hash } });
}

async function validateAuditChain(options = {}) {
  const where = options.since ? { ts: { gte: new Date(options.since) } } : {};
  const logs = await prisma.audit_log.findMany({ where, orderBy: [{ ts: 'asc' }, { id: 'asc' }] });
  let prev = null;
  for (const rec of logs) {
    // Start a new chain when encountering a null prev_hash or a branch not matching current pointer
    if (rec.prev_hash == null || (prev && rec.prev_hash !== prev.hash)) { prev = rec; continue; }
    const strMeta = rec.meta_json ?? null;
    const objMeta = (() => { try { return strMeta ? JSON.parse(strMeta) : null; } catch { return null; } })();
    const expectedStr = computeHash(prev?.hash || null, { user_id: rec.user_id, action: rec.action, entity: rec.entity, entity_id: rec.entity_id, meta_json: strMeta });
    const expectedObj = computeHash(prev?.hash || null, { user_id: rec.user_id, action: rec.action, entity: rec.entity, entity_id: rec.entity_id, meta_json: objMeta });
    if (rec.hash !== expectedStr && rec.hash !== expectedObj) return { ok: false, badId: rec.id };
    prev = rec;
  }
  return { ok: true, count: logs.length };
}

module.exports = { writeAudit, validateAuditChain };
