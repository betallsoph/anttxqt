import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAdminPlanner } from "@/hooks/useAdminPlanner";
import type { PlannerItem } from "@/lib/takenote-api";
import { CalendarDays, Loader2, Plus, Save, Trash2 } from "lucide-react";

const fieldClass =
    "w-full text-base px-3 py-2.5 bg-zinc-50 rounded-md text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:outline-none";
const saveButtonClass =
    "h-auto cursor-pointer gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-[1px_1px_0_#000] transition-all duration-200 hover:bg-blue-100 active:translate-x-px active:translate-y-px active:shadow-none sm:text-sm";
const textActionClass =
    "h-auto cursor-pointer gap-1.5 px-0 text-base font-medium text-zinc-700 hover:bg-transparent hover:underline";
const deleteActionClass =
    "h-auto cursor-pointer gap-1.5 px-0 text-base font-medium text-red-600 hover:bg-transparent hover:underline";

const statusLabels: Record<PlannerItem["status"], string> = {
    todo: "To do",
    doing: "Doing",
    done: "Done",
};

const columns: PlannerItem["status"][] = ["todo", "doing", "done"];

function taskName(item: Pick<PlannerItem, "title">) {
    const name = item.title.trim();
    return name || "Untitled task";
}

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
        <div className="space-y-8">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
                <div>
                    <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        Planner
                    </h2>
                    <p className="text-sm text-zinc-600 mt-1">
                        Personal task planner — shared TakeNote MongoDB.
                    </p>
                </div>
                <Button type="button" variant="ghost" onClick={() => handleCreate("todo")} className={textActionClass}>
                    <Plus className="w-4 h-4" />
                    New task
                </Button>
            </motion.section>

            {error && (
                <section className="space-y-2">
                    <h3 className="text-lg font-bold text-red-700">Could not connect to TakeNote DB</h3>
                    <p className="text-base text-red-700">{error}</p>
                    <button type="button" onClick={reload} className="text-sm font-medium text-zinc-700 underline">
                        Retry
                    </button>
                </section>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] gap-10 items-start">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {columns.map((status) => (
                        <section key={status} className="space-y-3 min-w-0">
                            <div className="flex items-baseline justify-between gap-3">
                                <h3 className="text-lg font-bold text-zinc-800">{statusLabels[status]}</h3>
                                <button
                                    type="button"
                                    onClick={() => handleCreate(status)}
                                    className="text-sm font-medium text-zinc-700 hover:underline"
                                >
                                    Add
                                </button>
                            </div>
                            {grouped[status].length === 0 ? (
                                <p className="text-sm text-zinc-500">No tasks</p>
                            ) : (
                                <ul className="space-y-1">
                                    {grouped[status].map((item) => {
                                        const selected = selectedId === item.id;
                                        const shown =
                                            selected && draft && draft.id === item.id ? draft : item;
                                        return (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => openItem(item)}
                                                    className={`w-full text-left px-2 py-2.5 rounded-md text-base text-zinc-800 ${
                                                        selected ? "bg-zinc-100 font-semibold" : "hover:bg-zinc-50"
                                                    }`}
                                                >
                                                    <span className="block break-words">{taskName(shown)}</span>
                                                    {shown.dueDate ? (
                                                        <span className="block text-sm font-normal text-zinc-500 mt-0.5">
                                                            {shown.dueDate.slice(0, 10)}
                                                        </span>
                                                    ) : null}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>

                <section className="space-y-5 min-w-0">
                    <h3 className="text-lg font-bold text-zinc-800">Task</h3>
                    {!draft ? (
                        <p className="text-base text-zinc-600">Select a task to edit.</p>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="planner-title" className="mb-1.5 block text-sm font-medium text-zinc-600">
                                    Title
                                </label>
                                <input
                                    id="planner-title"
                                    type="text"
                                    value={draft.title}
                                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                    className={fieldClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="planner-description" className="mb-1.5 block text-sm font-medium text-zinc-600">
                                    Description
                                </label>
                                <textarea
                                    id="planner-description"
                                    value={draft.description ?? ""}
                                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                                    rows={8}
                                    className={`${fieldClass} min-h-56`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="planner-due-date" className="mb-1.5 block text-sm font-medium text-zinc-600">
                                        Due date
                                    </label>
                                    <input
                                        id="planner-due-date"
                                        type="date"
                                        value={draft.dueDate?.slice(0, 10) ?? ""}
                                        onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                                        className={fieldClass}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="planner-status" className="mb-1.5 block text-sm font-medium text-zinc-600">
                                        Status
                                    </label>
                                    <select
                                        id="planner-status"
                                        value={draft.status}
                                        onChange={(e) =>
                                            setDraft({
                                                ...draft,
                                                status: e.target.value as PlannerItem["status"],
                                            })
                                        }
                                        className={fieldClass}
                                    >
                                        <option value="todo">To do</option>
                                        <option value="doing">Doing</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="button" variant="ghost" onClick={handleSave} disabled={saving} className={saveButtonClass}>
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save
                                </Button>
                                <Button type="button" variant="ghost" onClick={handleDelete} className={deleteActionClass}>
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
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminPlannerPage;
