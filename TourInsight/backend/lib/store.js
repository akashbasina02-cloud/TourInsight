import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'database.json');
const EMPTY = {
  User: [], Trip: [], TripStop: [], Feedback: [], Guide: [], GuideReview: [], OfflinePack: [], Place: [], DestinationImage: [],
  PasswordReset: [],
};
let writeChain = Promise.resolve();

async function ensure() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try { await fs.access(DATA_FILE); } catch { await fs.writeFile(DATA_FILE, JSON.stringify(EMPTY, null, 2)); }
}

export async function readDb() {
  await ensure();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    return { ...EMPTY, ...parsed };
  } catch {
    return structuredClone(EMPTY);
  }
}

export async function writeDb(db) {
  await ensure();
  writeChain = writeChain.then(async () => {
    const tmp = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, DATA_FILE);
  });
  return writeChain;
}

export async function mutateDb(fn) {
  const db = await readDb();
  const result = await fn(db);
  await writeDb(db);
  return result;
}

export function publicUser(user) {
  if (!user) return null;
  const { password_hash, otp_code_hash, otp_expires_at, ...safe } = user;
  return safe;
}
