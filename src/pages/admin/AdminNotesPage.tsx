import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAdminNotes } from "@/hooks/useAdminNotes";
import type { TakeNoteNote } from "@/lib/takenote-api";
import { Loader2, Plus, Save, Trash2, StickyNote } from "lucide-react";

const inputClass =
    "w-full border border-zinc-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all";

function formatWhen(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
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
        <div className="space-y-6">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <StickyNote className="w-5 h-5" />
                        Notes
                    </h3>
                    <p className="text-sm text-zinc-600 mt-1">
                        Quick ideas from admin — synced directly to TakeNote MongoDB.
                    </p>
                </div>
                <Button variant="toolbar" size="sm" onClick={handleCreate}>
                    <Plus className="w-4 h-4" />
                    New note
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

            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
                <div className="border-2 border-black rounded-lg bg-white overflow-hidden">
                    <div className="px-3 py-2 border-b-2 border-black bg-zinc-100 text-xs font-bold uppercase">
                        Recent
                    </div>
                    <div className="max-h-[520px] overflow-y-auto divide-y divide-zinc-100">
                        {notes.length === 0 ? (
                            <p className="p-4 text-sm text-zinc-500">No notes yet.</p>
                        ) : (
                            notes.map((note) => (
                                <button
                                    key={note.id}
                                    type="button"
                                    onClick={() => openNote(note)}
                                    className={`w-full text-left p-3 hover:bg-blue-50 transition-colors ${
                                        selectedId === note.id ? "bg-blue-100" : ""
                                    }`}
                                >
                                    <p className="font-bold text-sm truncate">
                                        {note.title || "Untitled note"}
                                    </p>
                                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                                        {note.content || "Empty note"}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="border-2 border-black rounded-lg bg-white p-4 sm:p-5 space-y-4">
                    {!draft ? (
                        <p className="text-sm text-zinc-500 py-8 text-center">
                            Select a note or create a new one.
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
                                    placeholder="Project idea..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1 uppercase text-zinc-600">
                                    Content
                                </label>
                                <textarea
                                    value={draft.content}
                                    onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                                    className={`${inputClass} min-h-[280px] leading-relaxed`}
                                    placeholder="Write your note here..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1 uppercase text-zinc-600">
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
                                    className={inputClass}
                                    placeholder="portfolio, idea, devops"
                                />
                            </div>

                            {selected && (
                                <p className="text-xs text-zinc-500">
                                    Updated: {formatWhen(selected.updatedAt as string) || "—"}
                                </p>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                <Button variant="action" size="sm" onClick={handleSave} disabled={saving}>
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save
                                </Button>
                                <Button variant="secondary" size="sm" onClick={handleDelete}>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminNotesPage;
