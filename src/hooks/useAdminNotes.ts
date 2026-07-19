import { useCallback, useEffect, useState } from "react";
import {
    createNote,
    deleteNote,
    fetchNotes,
    TakeNoteApiError,
    updateNote,
    type TakeNoteNote,
} from "@/lib/takenote-api";

export function useAdminNotes() {
    const [notes, setNotes] = useState<TakeNoteNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const reload = useCallback(() => setReloadKey((key) => key + 1), []);

    useEffect(() => {
        let cancelled = false;

        fetchNotes()
            .then((items) => {
                if (!cancelled) setNotes(items);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof TakeNoteApiError ? err.message : "Không tải được notes.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const saveNote = async (note: TakeNoteNote) => {
        const payload = {
            title: note.title,
            content: note.content,
            tags: note.tags ?? [],
        };

        if (note.id.startsWith("new-")) {
            const created = await createNote(payload);
            setNotes((prev) => [created, ...prev.filter((n) => n.id !== note.id)]);
            return created;
        }

        const updated = await updateNote(note.id, payload);
        setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, ...updated } : n)));
        return updated;
    };

    const removeNote = async (id: string) => {
        if (id.startsWith("new-")) {
            setNotes((prev) => prev.filter((n) => n.id !== id));
            return;
        }
        await deleteNote(id);
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    return { notes, loading, error, reload, saveNote, removeNote, setNotes };
}
