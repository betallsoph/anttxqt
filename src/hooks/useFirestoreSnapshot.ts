import { useCallback, useEffect, useRef, useState } from "react";
import type { DocumentData, DocumentReference } from "firebase/firestore";
import {
    getDocWithRetry,
    invalidateCachedDoc,
    isAbortError,
    isFreshCachedDoc,
    peekCachedDoc,
} from "@/lib/firestore-utils";
import { useRetryOnVisible } from "@/hooks/useRetryOnVisible";

/**
 * Shared fetch/cache lifecycle for public site docs.
 * Hydrates from the module cache on mount so tab switches don't flash a spinner.
 */
export function useFirestoreSnapshot(ref: DocumentReference<DocumentData>) {
    const path = ref.path;
    const cached = peekCachedDoc(ref);

    const [state, setState] = useState(() => ({
        path,
        snapshot: cached,
        loading: !cached,
        error: null as string | null,
    }));

    if (state.path !== path) {
        const next = peekCachedDoc(ref);
        setState({
            path,
            snapshot: next,
            loading: !next,
            error: null,
        });
    }

    const skipCacheRef = useRef(false);
    const [reloadKey, setReloadKey] = useState(0);

    const retry = useCallback(() => {
        skipCacheRef.current = true;
        invalidateCachedDoc(path);
        setState((current) => ({ ...current, path, loading: true, error: null }));
        setReloadKey((key) => key + 1);
    }, [path]);

    useEffect(() => {
        const skipCache = skipCacheRef.current;
        skipCacheRef.current = false;

        if (!skipCache && isFreshCachedDoc(ref)) {
            return;
        }

        const controller = new AbortController();
        let cancelled = false;

        getDocWithRetry(ref, { signal: controller.signal, skipCache })
            .then((snapshot) => {
                if (cancelled || controller.signal.aborted) return;
                setState({ path, snapshot, loading: false, error: null });
            })
            .catch((err) => {
                if (cancelled || controller.signal.aborted || isAbortError(err)) return;
                console.error(`Failed to fetch ${path}:`, err);
                if (peekCachedDoc(ref)) return;
                setState((current) => ({
                    ...current,
                    loading: false,
                    error: err instanceof Error ? err.message : String(err),
                }));
            })
            .finally(() => {
                if (!cancelled && !controller.signal.aborted) {
                    setState((current) => (current.loading ? { ...current, loading: false } : current));
                }
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [path, ref, reloadKey]);

    useRetryOnVisible(state.error !== null, retry);

    const snapshot = state.path === path ? state.snapshot : peekCachedDoc(ref);
    const loading = state.path === path ? state.loading : !snapshot;
    const error = state.path === path ? state.error : null;

    return { snapshot, loading, error, retry };
}
