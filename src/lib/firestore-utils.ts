import { getDoc, type DocumentData, type DocumentReference, type DocumentSnapshot } from "firebase/firestore";

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

// getDoc can stay pending forever without ever resolving or rejecting
// (firebase-js-sdk#5402), typically after the tab is suspended and its
// connection dies. The SDK has no timeout of its own, so it has to come
// from here — otherwise a caller's .finally() never runs.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
        promise.then(
            (value) => {
                clearTimeout(timer);
                resolve(value);
            },
            (err) => {
                clearTimeout(timer);
                reject(err);
            },
        );
    });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDocWithRetry(
    ref: DocumentReference<DocumentData>,
    { timeoutMs = DEFAULT_TIMEOUT_MS, attempts = DEFAULT_ATTEMPTS } = {},
): Promise<DocumentSnapshot<DocumentData>> {
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt++) {
        try {
            return await withTimeout(getDoc(ref), timeoutMs);
        } catch (err) {
            lastError = err;
            const code = (err as { code?: string }).code;
            if (code && NON_RETRYABLE_CODES.has(code)) break;
            if (attempt < attempts - 1) {
                await sleep(Math.min(1000 * 2 ** attempt, 30_000));
            }
        }
    }

    throw lastError;
}
