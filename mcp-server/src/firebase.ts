import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (_db) return _db;
  const path =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!path) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_PATH (or GOOGLE_APPLICATION_CREDENTIALS)."
    );
  }
  const serviceAccount = JSON.parse(readFileSync(resolve(path), "utf8"));
  const app: App = initializeApp({ credential: cert(serviceAccount) });
  _db = getFirestore(app);
  return _db;
}

const COLLECTION = "siteConfig";

/** Read full siteConfig/<id> document. Returns {} if missing. */
export async function readDoc(id: string): Promise<Record<string, any>> {
  const snap = await getDb().collection(COLLECTION).doc(id).get();
  return snap.exists ? (snap.data() as Record<string, any>) : {};
}

/** Overwrite full siteConfig/<id> document (same as app setDoc). */
export async function writeDoc(id: string, data: Record<string, any>): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).set(data);
}
