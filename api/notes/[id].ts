import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { handleOptions, setCors } from "../_lib/http.js";
import { getDb, getNotesCollectionName } from "../_lib/mongodb.js";
import { serializeDoc, toObjectId } from "../_lib/serialize.js";

function noteBody(doc: Record<string, unknown>) {
    return {
        title: typeof doc.title === "string" ? doc.title : "",
        content:
            typeof doc.content === "string"
                ? doc.content
                : typeof doc.text === "string"
                  ? doc.text
                  : typeof doc.body === "string"
                    ? doc.body
                    : "",
        tags: Array.isArray(doc.tags) ? doc.tags.filter((t) => typeof t === "string") : [],
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    setCors(res);

    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const objectId = toObjectId(id);
    if (!objectId) {
        res.status(400).json({ error: "Invalid note id." });
        return;
    }

    const collectionName = getNotesCollectionName();

    try {
        const db = await getDb();
        const collection = db.collection(collectionName);

        if (req.method === "PUT") {
            const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            const { title, content, tags } = noteBody(body ?? {});
            const now = new Date();

            const result = await collection.findOneAndUpdate(
                { _id: objectId },
                {
                    $set: {
                        title,
                        content,
                        text: content,
                        tags,
                        updatedAt: now,
                        lastUpdated: now.toISOString(),
                    },
                },
                { returnDocument: "after" },
            );

            if (!result) {
                res.status(404).json({ error: "Note not found." });
                return;
            }

            res.status(200).json(serializeDoc(result));
            return;
        }

        if (req.method === "DELETE") {
            const result = await collection.deleteOne({ _id: objectId });
            if (result.deletedCount === 0) {
                res.status(404).json({ error: "Note not found." });
                return;
            }
            res.status(204).end();
            return;
        }

        res.setHeader("Allow", "PUT, DELETE, OPTIONS");
        res.status(405).json({ error: "Method not allowed." });
    } catch (error) {
        console.error("notes id error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error.",
        });
    }
}
