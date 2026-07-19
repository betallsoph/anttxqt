import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAdminPlanner } from "@/hooks/useAdminPlanner";
import type { PlannerItem } from "@/lib/takenote-api";
import { CalendarDays, Loader2, Plus, Save, Trash2 } from "lucide-react";

const inputClass =
    "w-full border border-zinc-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all";

const statusLabels: Record<PlannerItem["status"], string> = {
    todo: "To do",
    doing: "Doing",
    done: "Done",
};

const columns: PlannerItem["status"][] = ["todo", "doing", "done"];

export function AdminPlannerPage() {
    const { items, loading, error, reload, saveItem, removeItem, setItems } = useAdminPlanner();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [draft, setDraft] = useState<PlannerItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const grouped = useMemo(() => {
        const map: Record<PlannerItem["status"], PlannerItem[]> = {
            todo: [],
            doing: [],
            done: [],
        };
        for (const item of items) {
            map[item.status]?.push(item);
        }
        return map;
    }, [items]);

    const openItem = (item: PlannerItem) => {
        setSelectedId(item.id);
        setDraft({ ...item });
        setMessage("");
    };

    const handleCreate = (status: PlannerItem["status"] = "todo") => {
        const item: PlannerItem = {
            id: `new-${Date.now()}`,
            title: "",
            description: "",
            dueDate: "",
            status,
            priority: "medium",
        };
        setItems((prev) => [item, ...prev]);
        openItem(item);
    };

    const handleSave = async () => {
        if (!draft) return;
        setSaving(true);
        setMessage("");
        try {
            const saved = await saveItem(draft);
            setSelectedId(saved.id);
            setDraft({ ...saved });
            setMessage("Saved to TakeNote MongoDB.");
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to save.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const handleDelete = async () => {
        if (!draft) return;
        if (!confirm("Delete this planner task?")) return;
        try {
            await removeItem(draft.id);
            setSelectedId(null);
            setDraft(null);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to delete.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        Planner
                    </h3>
                    <p className="text-sm text-zinc-600 mt-1">
                        Personal task planner — shared TakeNote MongoDB.
                    </p>
                </div>
                <Button size="sm" onClick={() => handleCreate("todo")}>
                    <Plus className="w-4 h-4" />
                    New task
                </Button>
            </motion.section>

            {error && (
                <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4 text-sm text-red-700">
                    <p className="font-bold mb-1">Could not connect to TakeNote DB</p>
                    <p>{error}</p>
                    <button type="button" onClick={reload} className="mt-2 underline font-bold">
                        Retry
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {columns.map((status) => (
                        <div
                            key={status}
                            className="border-2 border-black rounded-lg bg-white overflow-hidden min-h-[320px]"
                        >
                            <div className="px-3 py-2 border-b-2 border-black bg-zinc-100 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase">{statusLabels[status]}</span>
                                <button
                                    type="button"
                                    onClick={() => handleCreate(status)}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                    + Add
                                </button>
                            </div>
                            <div className="p-2 space-y-2 max-h-[480px] overflow-y-auto">
                                {grouped[status].length === 0 ? (
                                    <p className="text-xs text-zinc-400 p-2">Empty</p>
                                ) : (
                                    grouped[status].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => openItem(item)}
                                            className={`w-full text-left border border-zinc-200 rounded-lg p-2 hover:bg-blue-50 transition-colors ${
                                                selectedId === item.id ? "bg-blue-100 border-blue-300" : "bg-white"
                                            }`}
                                        >
                                            <p className="font-bold text-sm">{item.title || "Untitled task"}</p>
                                            {item.dueDate && (
                                                <p className="text-[11px] text-zinc-500 mt-1">Due: {item.dueDate}</p>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-2 border-black rounded-lg bg-white p-4 space-y-4 h-fit">
                    {!draft ? (
                        <p className="text-sm text-zinc-500 py-8 text-center">
                            Select a task to edit.
                        </p>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-semibold mb-1 uppercase text-zinc-600">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={draft.title}
                                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1 uppercase text-zinc-600">
                                    Description
                                </label>
                                <textarea
                                    value={draft.description ?? ""}
                                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                                    className={`${inputClass} min-h-[120px]`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1 uppercase text-zinc-600">
                                        Due date
                                    </label>
                                    <input
                                        type="date"
                                        value={draft.dueDate?.slice(0, 10) ?? ""}
                                        onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1 uppercase text-zinc-600">
                                        Status
                                    </label>
                                    <select
                                        value={draft.status}
                                        onChange={(e) =>
                                            setDraft({
                                                ...draft,
                                                status: e.target.value as PlannerItem["status"],
                                            })
                                        }
                                        className={inputClass}
                                    >
                                        <option value="todo">To do</option>
                                        <option value="doing">Doing</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button size="sm" onClick={handleSave} disabled={saving}>
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save
                                </Button>
                                <Button size="sm" variant="noShadow" onClick={handleDelete}>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </Button>
                            </div>

                            {message && (
                                <p
                                    className={`text-sm font-bold ${
                                        message.toLowerCase().includes("fail") ||
                                        message.toLowerCase().includes("error")
                                            ? "text-red-500"
                                            : "text-green-600"
                                    }`}
                                >
                                    {message}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPlannerPage;
