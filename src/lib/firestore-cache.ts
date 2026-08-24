import { getDoc, type DocumentData, type DocumentReference, type DocumentSnapshot } from "firebase/firestore";

type GetDocFn = typeof getDoc;

type CacheEntry = {
    snapshot: DocumentSnapshot<DocumentData>;
    at: number;
};

const snapshotCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<DocumentSnapshot<DocumentData>>>();
const cacheGeneration = new Map<string, number>();

/** Skip a background refetch if the tab was loaded this recently. */
export const CACHE_TTL_MS = 60_000;

export function peekCachedDoc(
    ref: DocumentReference<DocumentData>,
): DocumentSnapshot<DocumentData> | undefined {
    return snapshotCache.get(ref.path)?.snapshot;
}

export function isFreshCachedDoc(
    ref: DocumentReference<DocumentData>,
    ttlMs = CACHE_TTL_MS,
): boolean {
    const entry = snapshotCache.get(ref.path);
    return !!entry && Date.now() - entry.at < ttlMs;
}

export function rememberCachedDoc(
    ref: DocumentReference<DocumentData>,
    snapshot: DocumentSnapshot<DocumentData>,
): void {
    snapshotCache.set(ref.path, { snapshot, at: Date.now() });
}

export function invalidateCachedDoc(refOrPath: DocumentReference<DocumentData> | string): void {
    const path = typeof refOrPath === "string" ? refOrPath : refOrPath.path;
    snapshotCache.delete(path);
    cacheGeneration.set(path, (cacheGeneration.get(path) ?? 0) + 1);
}

export function resetFirestoreDocCacheForTests(): void {
    snapshotCache.clear();
    inflight.clear();
    cacheGeneration.clear();
}

function cacheSnapshot(path: string, generation: number, snapshot: DocumentSnapshot<DocumentData>): void {
    if ((cacheGeneration.get(path) ?? 0) === generation) {
        snapshotCache.set(path, { snapshot, at: Date.now() });
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
            return snapshot;
        })
        .finally(() => {
            if (inflight.get(path) === promise) inflight.delete(path);
        });

    inflight.set(path, promise);
    return promise;
}
