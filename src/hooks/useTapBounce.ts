import { useEffect } from "react";

function findTapTarget(target: EventTarget | null) {
    if (!(target instanceof Element)) return null;

    const interactive = target.closest<HTMLElement>('button, a[href], [role="button"]');
    if (!interactive || interactive.dataset.tapImmediate === "true") return null;
    if (interactive.closest('[data-tap-zone="plain"]')) return null;
    if (interactive.matches(":disabled, [aria-disabled='true']")) return null;

    return interactive;
}

function bounceTouchTarget(element: HTMLElement) {
    element.classList.remove("tap-sink", "tap-bounce");
    void element.offsetWidth;
    element.classList.add("tap-sink");

    window.setTimeout(() => {
        if (!document.body.contains(element)) return;

        element.classList.remove("tap-sink");
        void element.offsetWidth;
        element.classList.add("tap-bounce");
    }, 100);
}

export function useTapBounce(enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        function handlePointerDown(event: PointerEvent) {
            if (event.pointerType !== "touch") return;

            const interactive = findTapTarget(event.target);
            if (!interactive) return;

            bounceTouchTarget(interactive);
        }

        function handleAnimationEnd(event: AnimationEvent) {
            if (event.animationName !== "tap-bounce") return;
            if (event.target instanceof HTMLElement) {
                event.target.classList.remove("tap-bounce");
            }
        }

        document.addEventListener("pointerdown", handlePointerDown, { passive: true });
        document.addEventListener("animationend", handleAnimationEnd, { passive: true });

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("animationend", handleAnimationEnd);
        };
    }, [enabled]);
}
