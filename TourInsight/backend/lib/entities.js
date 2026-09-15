import crypto from 'node:crypto';

export const ENTITY_NAMES = new Set(['Trip','TripStop','Feedback','Guide','GuideReview','OfflinePack','Place','DestinationImage']);
const PUBLIC_READ = new Set(['Guide','GuideReview','Place','DestinationImage']);

export function id() { return crypto.randomUUID(); }
export function now() { return new Date().toISOString(); }

export function canRead(entity, record, user) {
  if (PUBLIC_READ.has(entity)) return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (entity === 'Trip' && record.is_public) return true;
  return record.created_by_id === user.id;
}
export function canCreate(entity, user) {
  if (!user) return false;
  if (entity === 'DestinationImage') return user.role === 'admin';
  return true;
}
export function canUpdate(entity, record, user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return record.created_by_id === user.id;
}
export function canDelete(entity, record, user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (entity === 'DestinationImage') return false;
  return record.created_by_id === user.id;
}

export function makeRecord(data, user, extra = {}) {
  const t = now();
  return { id: id(), created_date: t, updated_date: t, created_by_id: user?.id || null, ...data, ...extra };
}

export function matches(record, query = {}) {
  return Object.entries(query || {}).every(([key, expected]) => {
    const actual = record[key];
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if ('$in' in expected) return expected.$in.includes(actual);
      if ('$nin' in expected) return !expected.$nin.includes(actual);
      if ('$gt' in expected && !(actual > expected.$gt)) return false;
      if ('$gte' in expected && !(actual >= expected.$gte)) return false;
      if ('$lt' in expected && !(actual < expected.$lt)) return false;
      if ('$lte' in expected && !(actual <= expected.$lte)) return false;
      if ('$ne' in expected && actual === expected.$ne) return false;
      return true;
    }
    return actual === expected;
  });
}

export function sortRows(rows, sort = '') {
  if (!sort) return rows;
  const desc = sort.startsWith('-'); const key = desc ? sort.slice(1) : sort;
  return [...rows].sort((a,b) => {
    const av = a[key], bv = b[key];
    if (av === bv) return 0; if (av == null) return 1; if (bv == null) return -1;
    return (av > bv ? 1 : -1) * (desc ? -1 : 1);
  });
}
