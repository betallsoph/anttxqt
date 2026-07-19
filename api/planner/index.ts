import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { handleOptions, setCors } from "../_lib/http.js";
import { getDb, getPlannerCollectionName } from "../_lib/mongodb.js";
import { serializeDoc } from "../_lib/serialize.js";

const STATUSES = new Set(["todo", "doing", "done"]);

function plannerBody(doc: Record<string, unknown>) {
    const status = typeof doc.status === "string" ? doc.status.toLowerCase() : "todo";
    return {
        title: typeof doc.title === "string" ? doc.title : "",
        description:
            typeof doc.description === "string"
                ? doc.description
                : typeof doc.notes === "string"
                  ? doc.notes
                  : "",
        dueDate:
            typeof doc.dueDate === "string"
                ? doc.dueDate
                : typeof doc.date === "string"
                  ? doc.date
                  : "",
        status: STATUSES.has(status) ? status : "todo",
        priority: typeof doc.priority === "string" ? doc.priority : "medium",
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    setCors(res);

    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const collectionName = getPlannerCollectionName();

    try {
        const db = await getDb();
        const collection = db.collection(collectionName);

        if (req.method === "GET") {
            const docs = await collection
                .find({})
                .sort({ dueDate: 1, updatedAt: -1, createdAt: -1 })
                .limit(200)
                .toArray();

            res.status(200).json({
                items: docs.map((doc) => {
                    const serialized = serializeDoc(doc);
                    return {
                        ...serialized,
                        ...plannerBody(serialized),
                    };
                }),
            });
            return;
        }

        if (req.method === "POST") {
            const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            const parsed = plannerBody(body ?? {});
            const now = new Date();

            const insert = {
                ...parsed,
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
        console.error("planner index error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error.",
        });
    }
}
