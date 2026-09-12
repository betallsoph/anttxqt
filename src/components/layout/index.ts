export { Header } from "./Header";
export { Footer } from "./Footer";
export { Layout } from "./Layout";

// AdminLayout is intentionally NOT re-exported here. Anything that imports
// this barrel would pull it — and firebase/auth with it — into the public
// first-load bundle. Import it from "./AdminLayout" directly (App.tsx lazies it).
