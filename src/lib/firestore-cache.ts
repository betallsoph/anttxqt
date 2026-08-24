import { getDoc, type DocumentData, type DocumentReference, type DocumentSnapshot } from "firebase/firestore";

type GetDocFn = typeof getDoc;

const snapshotCache = new Map<string, DocumentSnapshot<DocumentData>>();
const inflight = new Map<string, Promise<DocumentSnapshot<DocumentData>>>();
const cacheGeneration = new Map<string, number>();

export function peekCachedDoc(
    ref: DocumentReference<DocumentData>,
): DocumentSnapshot<DocumentData> | undefined {
    return snapshotCache.get(ref.path);
}

export function invalidateCachedDoc(refOrPath: DocumentReference<DocumentData> | string): void {
    const path = typeof refOrPath === "string" ? refOrPath : refOrPath.path;
    snapshotCache.delete(path);
    cacheGeneration.set(path, (cacheGeneration.get(path) ?? 0) + 1);
}

function cacheSnapshot(path: string, generation: number, snapshot: DocumentSnapshot<DocumentData>): void {
    if ((cacheGeneration.get(path) ?? 0) === generation) {
        snapshotCache.set(path, snapshot);
    }
}

/** One physical getDoc per path; concurrent callers share the same promise. */
export function getOrStartInflightDoc(
    ref: DocumentReference<DocumentData>,
    getDocFn: GetDocFn = getDoc,
): Promise<DocumentSnapshot<DocumentData>> {
    const path = ref.path;
    const existing = inflight.get(path);
    if (existing) return existing;

    const generation = cacheGeneration.get(path) ?? 0;
    const promise = getDocFn(ref)
        .then((snapshot) => {
            cacheSnapshot(path, generation, snapshot);
            inflight.delete(path);
            return snapshot;
        })
        .catch((err) => {
            inflight.delete(path);
            throw err;
        });

    inflight.set(path, promise);
    return promise;
}

/** Wait for an in-flight getDoc on this path without starting a new fetch. */
export async function waitForInflightDoc(
    ref: DocumentReference<DocumentData>,
): Promise<void> {
    const existing = inflight.get(ref.path);
    if (!existing) return;
    try {
        await existing;
    } catch {
        // Stale inflight errors are ignored; caller will start a fresh fetch.
    }
}
