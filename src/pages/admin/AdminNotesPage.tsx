import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAdminNotes } from "@/hooks/useAdminNotes";
import type { TakeNoteNote } from "@/lib/takenote-api";
import { Loader2, Plus, Save, Trash2, StickyNote } from "lucide-react";

const fieldClass =
    "w-full text-base px-3 py-2.5 bg-zinc-50 rounded-md text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:outline-none";
const saveButtonClass =
    "h-auto cursor-pointer gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-[1px_1px_0_#000] transition-all duration-200 hover:bg-blue-100 active:translate-x-px active:translate-y-px active:shadow-none sm:text-sm";
const textActionClass =
    "h-auto cursor-pointer gap-1.5 px-0 text-base font-medium text-zinc-700 hover:bg-transparent hover:underline";
const deleteActionClass =
    "h-auto cursor-pointer gap-1.5 px-0 text-base font-medium text-red-600 hover:bg-transparent hover:underline";

function formatWhen(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
}

function noteTitle(title?: string) {
    const trimmed = title?.trim();
    return trimmed ? trimmed : "Untitled note";
}

export function AdminNotesPage() {
    const { notes, loading, error, reload, saveNote, removeNote, setNotes } = useAdminNotes();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [draft, setDraft] = useState<TakeNoteNote | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const selected = useMemo(
        () => notes.find((note) => note.id === selectedId) ?? null,
        [notes, selectedId],
    );

    const openNote = (note: TakeNoteNote) => {
        setSelectedId(note.id);
        setDraft({ ...note, tags: note.tags ?? [] });
        setMessage("");
    };

    const handleCreate = () => {
        const note: TakeNoteNote = {
            id: `new-${Date.now()}`,
            title: "",
            content: "",
            tags: [],
        };
        setNotes((prev) => [note, ...prev]);
        openNote(note);
    };

    const handleSave = async () => {
        if (!draft) return;
        setSaving(true);
        setMessage("");
        try {
            const saved = await saveNote(draft);
            setSelectedId(saved.id);
            setDraft({ ...saved, tags: saved.tags ?? [] });
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
        if (!confirm("Delete this note from TakeNote DB?")) return;
        try {
            await removeNote(draft.id);
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
                        <StickyNote className="w-5 h-5" />
                        Notes
                    </h2>
                    <p className="text-sm text-zinc-600 mt-1">
                        Quick ideas from admin — synced directly to TakeNote MongoDB.
                    </p>
                </div>
                <Button type="button" variant="ghost" onClick={handleCreate} className={textActionClass}>
                    <Plus className="w-4 h-4" />
                    New note
                </Button>
            </motion.section>

            {error && (
                <div className="text-sm text-red-700">
                    <p className="font-semibold">Could not connect to TakeNote DB</p>
                    <p className="mt-1">{error}</p>
                    <button type="button" onClick={reload} className="mt-2 font-medium text-zinc-700 underline">
                        Retry
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-10 items-start">
                <section>
                    <h3 className="text-lg font-bold text-zinc-800 mb-3">Recent</h3>
                    {notes.length === 0 ? (
                        <p className="text-base text-zinc-500">No notes yet.</p>
                    ) : (
                        <ul className="max-h-[520px] overflow-y-auto space-y-1">
                            {notes.map((note) => {
                                const active = selectedId === note.id;
                                return (
                                    <li key={note.id}>
                                        <button
                                            type="button"
                                            onClick={() => openNote(note)}
                                            className={`w-full text-left px-3 py-2.5 rounded-md ${
                                                active ? "bg-zinc-100" : "hover:bg-zinc-50"
                                            }`}
                                        >
                                            <span className="block text-base font-semibold text-zinc-800 truncate">
                                                {noteTitle(note.title)}
                                            </span>
                                            <span className="block text-sm text-zinc-500 line-clamp-2 mt-0.5">
                                                {note.content?.trim() || "Empty note"}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section>
                    <h3 className="text-lg font-bold text-zinc-800 mb-4">
                        {draft ? "Edit note" : "Note"}
                    </h3>
                    {!draft ? (
                        <p className="text-base text-zinc-500">
                            Select a note or create a new one.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-600 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={draft.title}
                                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                    className={fieldClass}
                                    placeholder="Project idea..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-600 mb-1.5">Content</label>
                                <textarea
                                    value={draft.content}
                                    onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                                    className={`${fieldClass} min-h-[280px] leading-relaxed`}
                                    placeholder="Write your note here..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-600 mb-1.5">
                                    Tags (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={(draft.tags ?? []).join(", ")}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            tags: e.target.value
                                                .split(",")
                                                .map((tag) => tag.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                    className={fieldClass}
                                    placeholder="portfolio, idea, devops"
                                />
                            </div>

                            {selected && (
                                <p className="text-sm text-zinc-500">
                                    Updated: {formatWhen(selected.updatedAt as string) || "—"}
                                </p>
                            )}

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
                                {message && (
                                    <span
                                        className={`text-sm font-bold ${
                                            message.toLowerCase().includes("fail") ||
                                            message.toLowerCase().includes("error")
                                                ? "text-red-500"
                                                : "text-green-600"
                                        }`}
                                    >
                                        {message}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminNotesPage;
