import { useCallback, useEffect, useState } from "react";
import {
    createPlannerItem,
    deletePlannerItem,
    fetchPlannerItems,
    TakeNoteApiError,
    updatePlannerItem,
    type PlannerItem,
} from "@/lib/takenote-api";

export function useAdminPlanner() {
    const [items, setItems] = useState<PlannerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const reload = useCallback(() => setReloadKey((key) => key + 1), []);

    useEffect(() => {
        let cancelled = false;

        fetchPlannerItems()
            .then((data) => {
                if (!cancelled) setItems(data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof TakeNoteApiError ? err.message : "Failed to load planner.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const saveItem = async (item: PlannerItem) => {
        const payload = {
            title: item.title,
            description: item.description ?? "",
            dueDate: item.dueDate ?? "",
            status: item.status,
            priority: item.priority ?? "medium",
        };

        if (item.id.startsWith("new-")) {
            const created = await createPlannerItem(payload);
            setItems((prev) => [created, ...prev.filter((n) => n.id !== item.id)]);
            return created;
        }

        const updated = await updatePlannerItem(item.id, payload);
        setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, ...updated } : n)));
        return updated;
    };

    const removeItem = async (id: string) => {
        if (id.startsWith("new-")) {
            setItems((prev) => prev.filter((n) => n.id !== id));
            return;
        }
        await deletePlannerItem(id);
        setItems((prev) => prev.filter((n) => n.id !== id));
    };

    return { items, loading, error, reload, saveItem, removeItem, setItems };
}
