import { getDoc, type DocumentData, type DocumentReference, type DocumentSnapshot } from "firebase/firestore";
import {
    getOrStartInflightDoc,
    invalidateCachedDoc,
    isFreshCachedDoc,
    peekCachedDoc,
    rememberCachedDoc,
} from "./firestore-cache";

export { invalidateCachedDoc, isFreshCachedDoc, peekCachedDoc, rememberCachedDoc };

const DEFAULT_TIMEOUT_MS = 8_000;
// Two, not three: the timed-out getDoc keeps running in the background and
// usually warms the SDK cache, so attempt two resolves instantly. A third
// attempt rarely wins anything and costs the user another 8s of staring.
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

// getDoc can stay pending forever without ever resolving or rejecting
// (firebase-js-sdk#5402), typically after the tab is suspended and its
// connection dies. The SDK has no timeout of its own, so it has to come
// from here — otherwise a caller's .finally() never runs.
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
    getDocFn?: typeof getDoc;
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
