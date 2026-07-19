import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { ALLOWED_ADMIN_EMAILS } from "./admin-config.js";

let firebaseApp: App | null = null;

function getFirebaseApp(): App {
    if (firebaseApp) return firebaseApp;
    const existing = getApps()[0];
    if (existing) {
        firebaseApp = existing;
        return existing;
    }

    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!json) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable.");
    }

    firebaseApp = initializeApp({
        credential: cert(JSON.parse(json)),
    });
    return firebaseApp;
}

export async function requireAdmin(
    req: VercelRequest,
    res: VercelResponse,
): Promise<{ email: string } | null> {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing authorization token." });
        return null;
    }

    try {
        const token = header.slice("Bearer ".length);
        const decoded = await getAuth(getFirebaseApp()).verifyIdToken(token);
        const email = decoded.email?.toLowerCase();

        if (!email || !ALLOWED_ADMIN_EMAILS.includes(email)) {
            res.status(403).json({ error: "Forbidden." });
            return null;
        }

        return { email };
    } catch {
        res.status(401).json({ error: "Invalid authorization token." });
        return null;
    }
}
