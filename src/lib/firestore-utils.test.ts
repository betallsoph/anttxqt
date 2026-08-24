import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { DocumentReference, DocumentSnapshot } from "firebase/firestore";
import {
    getOrStartInflightDoc,
    peekCachedDoc,
    resetFirestoreDocCacheForTests,
} from "./firestore-cache.ts";
import { getDocWithRetry, isAbortError, TimeoutError } from "./firestore-utils.ts";

function ref(path: string): DocumentReference {
    return { path } as DocumentReference;
}

function snapshot(path: string): DocumentSnapshot {
    return {
        exists: () => true,
        data: () => ({ path }),
    } as unknown as DocumentSnapshot;
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
        resolve = res;
    });
    return { promise, resolve };
}

afterEach(() => {
    resetFirestoreDocCacheForTests();
});

describe("getOrStartInflightDoc", () => {
    it("shares one physical getDoc per path", async () => {
        let calls = 0;
        const pending = deferred<DocumentSnapshot>();
        const getDocFn = async () => {
            calls += 1;
            return pending.promise;
        };

        const first = getOrStartInflightDoc(ref("siteConfig/products"), getDocFn);
        const second = getOrStartInflightDoc(ref("siteConfig/products"), getDocFn);
        assert.equal(calls, 1);

        pending.resolve(snapshot("products"));
        const [a, b] = await Promise.all([first, second]);
        assert.equal(a, b);
        assert.equal(calls, 1);
        assert.ok(peekCachedDoc(ref("siteConfig/products")));
    });

    it("starts a separate getDoc for a different path", async () => {
        let calls = 0;
        const getDocFn = async (docRef: DocumentReference) => {
            calls += 1;
            return snapshot(docRef.path);
        };

        await Promise.all([
            getOrStartInflightDoc(ref("siteConfig/products"), getDocFn),
            getOrStartInflightDoc(ref("siteConfig/projects"), getDocFn),
        ]);
        assert.equal(calls, 2);
    });
});

describe("getDocWithRetry", () => {
    it("does not start a second getDoc when the first attempt times out", async () => {
        let calls = 0;
        const pending = deferred<DocumentSnapshot>();
        const getDocFn = async () => {
            calls += 1;
            return pending.promise;
        };

        const result = getDocWithRetry(ref("siteConfig/homepage"), {
            timeoutMs: 20,
            attempts: 2,
            getDocFn,
        });

        await new Promise((resolve) => setTimeout(resolve, 80));
        assert.equal(calls, 1);

        pending.resolve(snapshot("homepage"));
        await result;
        assert.equal(calls, 1);
    });

    it("abort rejects the waiter without starting another getDoc", async () => {
        let calls = 0;
        const pending = deferred<DocumentSnapshot>();
        const getDocFn = async () => {
            calls += 1;
            return pending.promise;
        };
        const controller = new AbortController();

        const waiter = getDocWithRetry(ref("siteConfig/explore"), {
            timeoutMs: 5_000,
            getDocFn,
            signal: controller.signal,
        });

        controller.abort();
        await assert.rejects(waiter, (err: unknown) => isAbortError(err));
        assert.equal(calls, 1);

        pending.resolve(snapshot("explore"));
        await pending.promise;
        assert.ok(peekCachedDoc(ref("siteConfig/explore")));
    });

    it("surfaces TimeoutError when getDoc never settles", async () => {
        const getDocFn = () => new Promise<DocumentSnapshot>(() => {});
        await assert.rejects(
            getDocWithRetry(ref("siteConfig/homepage"), {
                timeoutMs: 20,
                attempts: 1,
                getDocFn,
            }),
            (err: unknown) => err instanceof TimeoutError,
        );
    });
});
