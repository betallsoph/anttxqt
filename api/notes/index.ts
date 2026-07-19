import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { handleOptions, setCors } from "../_lib/http.js";
import { getDb, getNotesCollectionName } from "../_lib/mongodb.js";
import { serializeDoc } from "../_lib/serialize.js";

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

    const collectionName = getNotesCollectionName();

    try {
        const db = await getDb();
        const collection = db.collection(collectionName);

        if (req.method === "GET") {
            const docs = await collection
                .find({})
                .sort({ updatedAt: -1, lastUpdated: -1, createdAt: -1, created: -1 })
                .limit(200)
                .toArray();

            res.status(200).json({
                items: docs.map((doc) => {
                    const serialized = serializeDoc(doc);
                    return {
                        ...serialized,
                        ...noteBody(serialized),
                    };
                }),
            });
            return;
        }

        if (req.method === "POST") {
            const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            const { title, content, tags } = noteBody(body ?? {});
            const now = new Date();

            const insert = {
                title,
                content,
                text: content,
                tags,
                createdAt: now,
                updatedAt: now,
                source: "portfolio-admin",
            };

            const result = await collection.insertOne(insert);
            const created = await collection.findOne({ _id: result.insertedId });
            res.status(201).json(serializeDoc(created!));
            return;
        }

        res.setHeader("Allow", "GET, POST, OPTIONS");
        res.status(405).json({ error: "Method not allowed." });
    } catch (error) {
        console.error("notes index error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error.",
        });
    }
}
