import { getDoc, type DocumentData, type DocumentReference, type DocumentSnapshot } from "firebase/firestore/lite";
import {
    getOrStartInflightDoc,
    invalidateCachedDoc,
    isFreshCachedDoc,
    peekCachedDoc,
    rememberCachedDoc,
    type GetDocFn,
} from "./firestore-cache.ts";

export { invalidateCachedDoc, isFreshCachedDoc, peekCachedDoc, rememberCachedDoc };

// 4s, not 8s. With Firestore Lite a read is a single REST round trip, so a
// healthy request lands in well under a second — anything still pending at 4s
// is a dead connection, not a slow one. Worst case the user now waits
// 4s + 1s backoff + 4s instead of 17s.
const DEFAULT_TIMEOUT_MS = 4_000;
// Two, not three: the timed-out request keeps running in the background and
// fills the module cache, so attempt two usually resolves instantly. A third
// attempt rarely wins anything and costs the user another 4s of staring.
const DEFAULT_ATTEMPTS = 2;

// Deterministic failures — a retry would fail the exact same way.
const NON_RETRYABLE_CODES = new Set([
    "permission-denied",
    "unauthenticated",
    "not-found",
    "invalid-argument",
]);

export class TimeoutError extends Error {
    constructor(ms: number) {
        super(`Firestore request timed out after ${ms}ms`);
        this.name = "TimeoutError";
    }
}

function createAbortError(): DOMException {
    return new DOMException("The operation was aborted.", "AbortError");
}

export function isAbortError(err: unknown): boolean {
    if (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") {
        return true;
    }
    return err instanceof Error && err.name === "AbortError";
}

// A read can stay pending without ever resolving or rejecting when the tab
// has been suspended and its network connection died under it. Neither the
// SDK nor fetch imposes a deadline, so it has to come from here — otherwise a
// caller's .finally() never runs and the spinner turns forever.
function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        if (signal?.aborted) {
            reject(createAbortError());
            return;
        }

        const timer = setTimeout(() => reject(new TimeoutError(ms)), ms);

        const onAbort = () => {
            clearTimeout(timer);
            reject(createAbortError());
        };

        signal?.addEventListener("abort", onAbort, { once: true });

        promise.then(
            (value) => {
                clearTimeout(timer);
                signal?.removeEventListener("abort", onAbort);
                resolve(value);
            },
            (err) => {
                clearTimeout(timer);
                signal?.removeEventListener("abort", onAbort);
                reject(err);
            },
        );
    });
}

function abortableSleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(createAbortError());
            return;
        }

        const onAbort = () => {
            clearTimeout(timer);
            signal?.removeEventListener("abort", onAbort);
            reject(createAbortError());
        };

        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);

        signal?.addEventListener("abort", onAbort, { once: true });
    });
}

export interface GetDocWithRetryOptions {
    timeoutMs?: number;
    attempts?: number;
    signal?: AbortSignal;
    skipCache?: boolean;
    getDocFn?: GetDocFn;
}

export async function getDocWithRetry(
    ref: DocumentReference<DocumentData>,
    {
        timeoutMs = DEFAULT_TIMEOUT_MS,
        attempts = DEFAULT_ATTEMPTS,
        signal,
        skipCache = false,
        getDocFn = getDoc,
    }: GetDocWithRetryOptions = {},
): Promise<DocumentSnapshot<DocumentData>> {
    if (skipCache) {
        invalidateCachedDoc(ref);
    }

    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt++) {
        if (signal?.aborted) throw createAbortError();

        // A timed-out getDoc may still complete during backoff. Use that
        // snapshot instead of opening a second request on the same path.
        if (attempt > 0) {
            const cached = peekCachedDoc(ref);
            if (cached) return cached;
        }

        try {
            // Timeout only abandons this caller's wait — the shared inflight
            // getDoc keeps running. Attempt 2 awaits that same promise.
            const snapshot = await withTimeout(getOrStartInflightDoc(ref, getDocFn), timeoutMs, signal);
            rememberCachedDoc(ref, snapshot);
            return snapshot;
        } catch (err) {
            if (isAbortError(err)) throw err;
            lastError = err;
            const code = (err as { code?: string }).code;
            if (code && NON_RETRYABLE_CODES.has(code)) break;
            if (attempt < attempts - 1) {
                await abortableSleep(Math.min(1000 * 2 ** attempt, 30_000), signal);
            }
        }
    }

    throw lastError;
}
