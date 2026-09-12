import { getAuth } from "firebase/auth";
import { app } from "./firebase";

// Kept out of firebase.ts on purpose: every public page imports `db`, so an
// `auth` export there would drag firebase/auth into the first-load bundle for
// visitors who can never sign in. Admin-only modules import from here instead.
export const auth = getAuth(app);
