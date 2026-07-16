import { useEffect } from "react";

// A suspended tab kills the Firestore connection, so a fetch that failed while
// the tab was hidden is worth retrying the moment the user comes back.
export function useRetryOnVisible(enabled: boolean, retry: () => void) {
    useEffect(() => {
        if (!enabled) return;

        const retryWhenVisible = () => {
            if (document.visibilityState === "visible") retry();
        };

        document.addEventListener("visibilitychange", retryWhenVisible);
        return () => document.removeEventListener("visibilitychange", retryWhenVisible);
    }, [enabled, retry]);
}
