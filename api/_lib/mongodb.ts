import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

let client: MongoClient | null = null;
let db: Db | null = null;

export function getDbName(): string {
    return process.env.MONGODB_DB_NAME || "takenote";
}

export function getNotesCollectionName(): string {
    return process.env.MONGODB_NOTES_COLLECTION || "notes";
}

export function getPlannerCollectionName(): string {
    return process.env.MONGODB_PLANNER_COLLECTION || "planner";
}

export async function getDb(): Promise<Db> {
    if (!uri) {
        throw new Error("Missing MONGODB_URI environment variable.");
    }

    if (db) return db;

    client = new MongoClient(uri);
    await client.connect();
    db = client.db(getDbName());
    return db;
}
