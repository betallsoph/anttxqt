import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { handleOptions, setCors } from "../_lib/http.js";
import { getDb, getPlannerCollectionName } from "../_lib/mongodb.js";
import { serializeDoc, toObjectId } from "../_lib/serialize.js";

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

    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const objectId = toObjectId(id);
    if (!objectId) {
        res.status(400).json({ error: "Invalid planner item id." });
        return;
    }

    const collectionName = getPlannerCollectionName();

    try {
        const db = await getDb();
        const collection = db.collection(collectionName);

        if (req.method === "PUT") {
            const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            const parsed = plannerBody(body ?? {});
            const now = new Date();

            const result = await collection.findOneAndUpdate(
                { _id: objectId },
                {
                    $set: {
                        ...parsed,
                        updatedAt: now,
                    },
                },
                { returnDocument: "after" },
            );

            if (!result) {
                res.status(404).json({ error: "Planner item not found." });
                return;
            }

            res.status(200).json(serializeDoc(result));
            return;
        }

        if (req.method === "DELETE") {
            const result = await collection.deleteOne({ _id: objectId });
            if (result.deletedCount === 0) {
                res.status(404).json({ error: "Planner item not found." });
                return;
            }
            res.status(204).end();
            return;
        }

        res.setHeader("Allow", "PUT, DELETE, OPTIONS");
        res.status(405).json({ error: "Method not allowed." });
    } catch (error) {
        console.error("planner id error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error.",
        });
    }
}
