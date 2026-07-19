import { auth } from "@/lib/firebase";

export class TakeNoteApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "TakeNoteApiError";
        this.status = status;
    }
}

async function getAuthHeaders(): Promise<HeadersInit> {
    const user = auth.currentUser;
    if (!user) {
        throw new TakeNoteApiError("Bạn cần đăng nhập admin trước.", 401);
    }

    const token = await user.getIdToken();
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(path, {
        ...init,
        headers: {
            ...headers,
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
            const data = await response.json();
            if (typeof data.error === "string") message = data.error;
        } catch {
            // ignore
        }
        throw new TakeNoteApiError(message, response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export interface TakeNoteNote {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    updatedAt?: string;
    createdAt?: string;
}

export interface PlannerItem {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    status: "todo" | "doing" | "done";
    priority?: string;
    updatedAt?: string;
    createdAt?: string;
}

export async function fetchNotes() {
    const data = await request<{ items: TakeNoteNote[] }>("/api/notes");
    return data.items;
}

export async function createNote(payload: Pick<TakeNoteNote, "title" | "content" | "tags">) {
    return request<TakeNoteNote>("/api/notes", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateNote(id: string, payload: Pick<TakeNoteNote, "title" | "content" | "tags">) {
    return request<TakeNoteNote>(`/api/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteNote(id: string) {
    return request<void>(`/api/notes/${id}`, { method: "DELETE" });
}

export async function fetchPlannerItems() {
    const data = await request<{ items: PlannerItem[] }>("/api/planner");
    return data.items;
}

export async function createPlannerItem(
    payload: Pick<PlannerItem, "title" | "description" | "dueDate" | "status" | "priority">,
) {
    return request<PlannerItem>("/api/planner", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updatePlannerItem(
    id: string,
    payload: Pick<PlannerItem, "title" | "description" | "dueDate" | "status" | "priority">,
) {
    return request<PlannerItem>(`/api/planner/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deletePlannerItem(id: string) {
    return request<void>(`/api/planner/${id}`, { method: "DELETE" });
}
