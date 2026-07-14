# Plan (spec thi công): MCP server cho portfolio Firebase

> Plan này viết để **model khác thực thi trực tiếp**. Mọi thứ cần biết đều nằm ở đây, không cần đọc lại codebase. Code trong plan là code thật, copy vào là chạy được (chỉ chỉnh nếu version SDK khác).

---

## 1. Context / mục tiêu
Portfolio là app Vite + React (thư mục repo gốc `/home/user/anttxqt`). Toàn bộ nội dung động lưu ở **Firebase Firestore**, collection **`siteConfig`**, mỗi "trang" là 1 document:

| Doc id (`siteConfig/<id>`) | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| `explore`  | `ExploreData` (object nhiều section) | ghi nguyên document |
| `homepage` | `HomepageData` (object) | ghi nguyên document |
| `projects` | `{ items: Project[] }` | mảng item, key theo `id` |
| `products` | `{ items: Project[] }` | mảng item, key theo `id` |

App hiện chỉ sửa được qua Admin UI (`src/pages/admin/*`) sau khi login Firebase Auth. App **ghi đè nguyên document** mỗi lần lưu (xem `saveExploreData`, `saveHomepageData`, `saveProjectsData`) — MCP phải làm y hệt để không lệch dữ liệu.

**Mục tiêu:** dựng MCP server (stdio) để Claude Desktop **đọc / thêm / sửa / xóa / sắp xếp** nội dung một cách **có ngữ cảnh và an toàn**:
- Có tool mô tả schema để AI hiểu cấu trúc trước khi động vào.
- Mọi thao tác ghi/xóa chạy **preview → confirm** (mặc định chỉ trả preview, phải gọi lại `confirm:true` mới ghi thật).
- Có guard `expectedHash` chống ghi đè lên dữ liệu đã cũ.

**Quyết định đã chốt với user:** dùng **Firebase Admin SDK** (service-account JSON), **không** dùng email/password. Preview→confirm cho mọi mutation.

---

## 2. Data shapes (nguồn: `src/hooks/*` — mirror chính xác, KHÔNG import từ app)
Các interface dưới là bản mirror thủ công. Không import trực tiếp từ `src/hooks/*` vì các file đó kéo theo firebase **client** SDK.

```ts
// ==== siteConfig/explore  (ExploreData) ====
interface ExploreItem {           // dùng cho beyondCode, impactPeople, lessonsFailed, offTheRecord
  title: string;
  summary: string;
  story: string;
  since?: string;
  imageUrl?: string;
  tags?: string[];
}
interface ExploreData {
  hiddenSections?: string[];      // tên các section bị ẩn, vd ["stories","favourites"]
  intro: { title: string; description: string };
  achievements: {
    title: string; issuer: string; date: string;
    description?: string; url?: string; imageUrl?: string;
  }[];
  currently: { label: string; value: string }[];
  favourites: { label: string; description?: string }[];
  beyondCode: ExploreItem[];
  stories: { title: string; content: string; topics?: string[] }[];
  whatsNext: { title: string; description?: string; status: "Planning" | "In Progress" | "Done" }[];
  readingCloselyIntro?: string;
  impactPeople: ExploreItem[];
  lessonsFailed: ExploreItem[];
  offTheRecord: ExploreItem[];
  moreAndMore: { label: string; description?: string; url?: string }[];
}

// ==== siteConfig/homepage  (HomepageData) ====
interface Experience {
  role: string; company: string; period: string;
  location?: string; description?: string[]; hidden?: boolean;
}
interface HomepageData {
  hero: { greeting: string; name: string; bio: string[]; email: string; avatarUrl?: string };
  skillCategories: { name: string; items: string[] }[];
  links: { label: string; url: string; iconUrl?: string }[];
  experiences?: Experience[];
}

// ==== siteConfig/projects  &  siteConfig/products  →  { items: Project[] } ====
type ProjectStatus = "Production" | "Staging" | "In Development" | "Concept" | "Retired";
interface Project {
  id: string;                     // KEY để định danh item (bắt buộc, unique trong mảng)
  hidden?: boolean;
  title: string;
  description: string;
  fullDescription?: string;
  storyBehind?: string;
  status: ProjectStatus;
  tags: string[];
  topics?: string[];
  roles?: string[];
  keyFeatures?: string[];
  githubUrl?: string; liveUrl?: string;
  iconUrl?: string; imageUrl?: string; images?: string[];
  // Đa ngữ (viết tay): titleVi, descriptionVi, storyBehindVi, keyFeaturesVi, fullDescriptionVi, showVi
  //                    titleAr, descriptionAr, storyBehindAr, keyFeaturesAr, fullDescriptionAr, showAr
  [key: string]: any;             // cho phép field đa ngữ động → zod phải .passthrough()
}
```

**Quy tắc lưu Project (bắt buộc giữ):** trước khi ghi doc `projects`/`products`, với mỗi item, lọc bỏ dòng rỗng ở MỌI field bắt đầu bằng `keyFeatures` (vd `keyFeatures`, `keyFeaturesVi`, `keyFeaturesAr`):
```ts
Object.keys(item).forEach((key) => {
  if (key.startsWith("keyFeatures") && Array.isArray(item[key])) {
    item[key] = item[key].filter((f) => typeof f === "string" && f.trim() !== "");
  }
});
```

---

## 3. Cấu trúc thư mục cần tạo
Tạo package Node/TS **độc lập** trong `mcp-server/` (không đụng app). Cây file:
```
mcp-server/
  package.json
  tsconfig.json
  .gitignore
  .env.example
  README.md
  src/
    firebase.ts
    util.ts
    registry.ts
    index.ts
```

### 3.1 `mcp-server/package.json`
```json
{
  "name": "portfolio-mcp",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "bin": { "portfolio-mcp": "dist/index.js" },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "firebase-admin": "^13.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0"
  }
}
```
> Sau khi tạo, chạy `npm install` để lock version thực tế. Nếu `@modelcontextprotocol/sdk` cài ra major khác và API đổi, chỉnh theo mục 5.

### 3.2 `mcp-server/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": false,
    "sourceMap": false
  },
  "include": ["src"]
}
```

### 3.3 `mcp-server/.gitignore`
```
node_modules
dist
.env
service-account.json
*.serviceaccount.json
```

### 3.4 `mcp-server/.env.example`
```
# Đường dẫn tới file service account JSON tải từ Firebase console
# (Project settings → Service accounts → Generate new private key)
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
```

---

## 4. Nội dung từng file src/

### 4.1 `src/firebase.ts`
Init Admin SDK từ service-account JSON; export `db` + helper đọc/ghi nguyên document.
```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (_db) return _db;
  const path =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!path) {
    throw new Error(
      "Thiếu FIREBASE_SERVICE_ACCOUNT_PATH (hoặc GOOGLE_APPLICATION_CREDENTIALS)."
    );
  }
  const serviceAccount = JSON.parse(readFileSync(resolve(path), "utf8"));
  const app: App = initializeApp({ credential: cert(serviceAccount) });
  _db = getFirestore(app);
  return _db;
}

const COLLECTION = "siteConfig";

/** Đọc nguyên document siteConfig/<id>. Trả {} nếu chưa tồn tại. */
export async function readDoc(id: string): Promise<Record<string, any>> {
  const snap = await getDb().collection(COLLECTION).doc(id).get();
  return snap.exists ? (snap.data() as Record<string, any>) : {};
}

/** Ghi ĐÈ nguyên document siteConfig/<id> (giống setDoc của app). */
export async function writeDoc(id: string, data: Record<string, any>): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).set(data);
}
```

### 4.2 `src/util.ts`
```ts
import { createHash } from "node:crypto";

/** Hash ổn định (sort key) để guard expectedHash. */
export function hashDoc(obj: unknown): string {
  return createHash("sha256").update(canonical(obj)).digest("hex").slice(0, 16);
}
function canonical(v: any): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canonical(v[k])).join(",") + "}";
}

/** Deep-merge object (dùng cho update_section mode="merge"). Mảng bị GHI ĐÈ, không nối. */
export function deepMerge(base: any, patch: any): any {
  if (Array.isArray(patch) || typeof patch !== "object" || patch === null) return patch;
  const out = { ...(base ?? {}) };
  for (const k of Object.keys(patch)) out[k] = deepMerge(base?.[k], patch[k]);
  return out;
}

/** Loại dòng rỗng ở mọi field keyFeatures* (bắt buộc cho Project). */
export function cleanProjectItem(item: any): any {
  const copy = JSON.parse(JSON.stringify(item));
  Object.keys(copy).forEach((key) => {
    if (key.startsWith("keyFeatures") && Array.isArray(copy[key])) {
      copy[key] = copy[key].filter((f: any) => typeof f === "string" && f.trim() !== "");
    }
  });
  return copy;
}

/** Chuẩn hoá output text cho MCP. */
export function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
```

### 4.3 `src/registry.ts`
Bản đồ ngữ cảnh: sections (đọc cấp doc) + collections (mảng item thêm/sửa/xóa từng phần). Đây là dữ liệu `describe_schema` trả về, và là bảng tra cho các tool.
```ts
export type SectionId = "explore" | "homepage" | "projects" | "products";

export interface CollectionDef {
  name: string;          // tên collection dùng ở tool, vd "explore.stories"
  docId: SectionId;      // document chứa nó
  arrayPath: string;     // đường dẫn tới mảng trong doc: "items" | "stories" | ...
  key: "id" | "index";   // cách định danh item
  description: string;
  itemShape: string;     // mô tả field (để AI hiểu), dạng text ngắn
}

export const SECTIONS: Record<SectionId, string> = {
  explore:  "Trang Explore: intro, achievements, currently, favourites, beyondCode, stories, whatsNext, impactPeople, lessonsFailed, offTheRecord, moreAndMore, hiddenSections.",
  homepage: "Trang chủ: hero, skillCategories, links, experiences.",
  projects: "Danh sách Projects: { items: Project[] }.",
  products: "Danh sách Products: { items: Project[] } (cùng shape Project).",
};

export const COLLECTIONS: CollectionDef[] = [
  { name: "projects", docId: "projects", arrayPath: "items", key: "id",
    description: "Các project. Item key theo field `id` (unique).",
    itemShape: "Project: id, title, description, status(Production|Staging|In Development|Concept|Retired), tags[], topics?[], roles?[], keyFeatures?[], fullDescription?, storyBehind?, githubUrl?, liveUrl?, iconUrl?, imageUrl?, images?[], hidden?, + field đa ngữ *Vi/*Ar." },
  { name: "products", docId: "products", arrayPath: "items", key: "id",
    description: "Các product. Cùng shape Project, key theo `id`.",
    itemShape: "Giống Project." },
  { name: "explore.stories", docId: "explore", arrayPath: "stories", key: "index",
    description: "Stories trong Explore. Key theo index (0-based).",
    itemShape: "{ title, content, topics?[] }" },
  { name: "explore.beyondCode", docId: "explore", arrayPath: "beyondCode", key: "index",
    description: "Skills Beyond Code. Key theo index.",
    itemShape: "ExploreItem: { title, summary, story, since?, imageUrl?, tags?[] }" },
  { name: "explore.achievements", docId: "explore", arrayPath: "achievements", key: "index",
    description: "Achievements. Key theo index.",
    itemShape: "{ title, issuer, date, description?, url?, imageUrl? }" },
  { name: "explore.favourites", docId: "explore", arrayPath: "favourites", key: "index",
    description: "Favourites. Key theo index.",
    itemShape: "{ label, description? }" },
  { name: "explore.currently", docId: "explore", arrayPath: "currently", key: "index",
    description: "Currently. Key theo index.",
    itemShape: "{ label, value }" },
  { name: "explore.moreAndMore", docId: "explore", arrayPath: "moreAndMore", key: "index",
    description: "My Resumé / More & More. Key theo index.",
    itemShape: "{ label, description?, url? }" },
  { name: "explore.whatsNext", docId: "explore", arrayPath: "whatsNext", key: "index",
    description: "What's Next. Key theo index.",
    itemShape: "{ title, description?, status(Planning|In Progress|Done) }" },
  { name: "explore.impactPeople", docId: "explore", arrayPath: "impactPeople", key: "index",
    description: "Impact / People. Key theo index.",
    itemShape: "ExploreItem" },
  { name: "explore.lessonsFailed", docId: "explore", arrayPath: "lessonsFailed", key: "index",
    description: "Lessons / Failed. Key theo index.",
    itemShape: "ExploreItem" },
  { name: "explore.offTheRecord", docId: "explore", arrayPath: "offTheRecord", key: "index",
    description: "Off the Record. Key theo index.",
    itemShape: "ExploreItem" },
];

export function findCollection(name: string): CollectionDef {
  const c = COLLECTIONS.find((x) => x.name === name);
  if (!c) throw new Error(`Collection không hợp lệ: "${name}". Hợp lệ: ${COLLECTIONS.map(c => c.name).join(", ")}`);
  return c;
}

/** Lấy mảng item hiện tại từ doc theo CollectionDef. */
export function getArray(doc: Record<string, any>, def: CollectionDef): any[] {
  return Array.isArray(doc[def.arrayPath]) ? doc[def.arrayPath] : [];
}
```

### 4.4 `src/index.ts` — MCP server + tools
Đăng ký 7 tool. Mọi mutation dùng preview→confirm + guard `expectedHash`.
```ts
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readDoc, writeDoc } from "./firebase.js";
import { hashDoc, deepMerge, cleanProjectItem, json } from "./util.js";
import { SECTIONS, COLLECTIONS, findCollection, getArray } from "./registry.js";

const server = new McpServer({ name: "portfolio-mcp", version: "1.0.0" });

const sectionEnum = z.enum(["explore", "homepage", "projects", "products"]);

// helper: ghi mảng lại vào doc (áp cleanProjectItem cho projects/products)
async function commitArray(def: ReturnType<typeof findCollection>, doc: Record<string, any>, arr: any[]) {
  const finalArr = def.docId === "projects" || def.docId === "products"
    ? arr.map(cleanProjectItem)
    : arr;
  const next = { ...doc, [def.arrayPath]: finalArr };
  await writeDoc(def.docId, next);
  return next;
}

// helper: check guard hash
function checkHash(doc: Record<string, any>, expectedHash?: string) {
  if (expectedHash && expectedHash !== hashDoc(doc)) {
    throw new Error("Document đã thay đổi kể từ lần đọc gần nhất. Hãy read_section lại rồi thử lại.");
  }
}

// 1) describe_schema -------------------------------------------------------
server.registerTool("describe_schema", {
  title: "Describe schema",
  description: "Trả về toàn bộ cấu trúc dữ liệu portfolio (sections + collections + cách key + quy tắc preview→confirm). GỌI TOOL NÀY TRƯỚC khi sửa để hiểu ngữ cảnh.",
  inputSchema: {},
}, async () => json({
  storage: "Firebase Firestore, collection 'siteConfig', mỗi trang là 1 document.",
  sections: SECTIONS,
  collections: COLLECTIONS,
  writeRules: "Mọi tool ghi/xóa mặc định chỉ trả PREVIEW. Phải gọi lại với confirm:true mới ghi thật. Có thể truyền expectedHash (lấy từ read_section) để chống ghi đè dữ liệu cũ.",
}));

// 2) read_section ----------------------------------------------------------
server.registerTool("read_section", {
  title: "Read section",
  description: "Đọc full document của 1 section. Trả kèm _hash (dùng cho expectedHash khi ghi).",
  inputSchema: { section: sectionEnum },
}, async ({ section }) => {
  const doc = await readDoc(section);
  return json({ section, _hash: hashDoc(doc), data: doc });
});

// 3) list_items ------------------------------------------------------------
server.registerTool("list_items", {
  title: "List items",
  description: "Liệt kê item của 1 collection (kèm index/id + tóm tắt) để nhắm đúng mục cần sửa/xóa.",
  inputSchema: { collection: z.string().describe("vd: projects, products, explore.stories") },
}, async ({ collection }) => {
  const def = findCollection(collection);
  const doc = await readDoc(def.docId);
  const arr = getArray(doc, def);
  const items = arr.map((it, i) => ({
    index: i,
    id: def.key === "id" ? it?.id : undefined,
    label: it?.title ?? it?.label ?? it?.role ?? `item ${i}`,
  }));
  return json({ collection, key: def.key, _hash: hashDoc(doc), count: items.length, items });
});

// 4) update_section (field cấp doc) ---------------------------------------
server.registerTool("update_section", {
  title: "Update section",
  description: "Sửa field cấp document (vd homepage.hero, explore.hiddenSections, explore.intro). mode=merge (deep-merge, mảng bị ghi đè) hoặc replace (ghi đè nguyên field trong patch). Mặc định preview; confirm:true để ghi.",
  inputSchema: {
    section: sectionEnum,
    patch: z.record(z.any()).describe("object chứa field cần đổi ở cấp cao nhất của document"),
    mode: z.enum(["merge", "replace"]).default("merge"),
    confirm: z.boolean().default(false),
    expectedHash: z.string().optional(),
  },
}, async ({ section, patch, mode, confirm, expectedHash }) => {
  const doc = await readDoc(section);
  checkHash(doc, expectedHash);
  const next = mode === "merge" ? deepMerge(doc, patch) : { ...doc, ...patch };
  if (!confirm) return json({ preview: true, section, mode, before: doc, after: next, hint: "Gọi lại với confirm:true để áp dụng." });
  await writeDoc(section, next);
  return json({ applied: true, section, _hash: hashDoc(next), data: next });
});

// 5) upsert_item (thêm/sửa item trong mảng) -------------------------------
server.registerTool("upsert_item", {
  title: "Upsert item",
  description: "Thêm mới hoặc sửa 1 item trong collection dạng mảng. Không truyền id/index => APPEND. Có id (collection key=id) hoặc index (key=index) => sửa item đó (merge nông với item cũ). Mặc định preview; confirm:true để ghi.",
  inputSchema: {
    collection: z.string(),
    item: z.record(z.any()).describe("object item (theo itemShape của collection)"),
    id: z.string().optional().describe("dùng cho collection key=id (projects/products)"),
    index: z.number().int().optional().describe("dùng cho collection key=index (explore.*)"),
    confirm: z.boolean().default(false),
    expectedHash: z.string().optional(),
  },
}, async ({ collection, item, id, index, confirm, expectedHash }) => {
  const def = findCollection(collection);
  const doc = await readDoc(def.docId);
  checkHash(doc, expectedHash);
  const arr = [...getArray(doc, def)];

  let mode: "append" | "update";
  let pos = -1;
  if (def.key === "id") {
    const targetId = id ?? item.id;
    if (targetId != null) pos = arr.findIndex((x) => x?.id === targetId);
    if (pos >= 0) { arr[pos] = { ...arr[pos], ...item }; mode = "update"; }
    else {
      if (!item.id) throw new Error("Thêm mới projects/products cần item.id (unique).");
      arr.push(item); mode = "append";
    }
  } else { // key=index
    if (index != null) {
      if (index < 0 || index >= arr.length) throw new Error(`index ${index} ngoài phạm vi (0..${arr.length - 1}).`);
      arr[index] = { ...arr[index], ...item }; pos = index; mode = "update";
    } else { arr.push(item); pos = arr.length - 1; mode = "append"; }
  }

  if (!confirm) return json({ preview: true, collection, mode, position: pos, resultingItem: arr[pos], hint: "Gọi lại với confirm:true để áp dụng." });
  const next = await commitArray(def, doc, arr);
  return json({ applied: true, collection, mode, position: pos, _hash: hashDoc(next) });
});

// 6) delete_item -----------------------------------------------------------
server.registerTool("delete_item", {
  title: "Delete item",
  description: "Xóa 1 item khỏi collection dạng mảng, theo id (key=id) hoặc index (key=index). Mặc định preview; confirm:true để xóa thật.",
  inputSchema: {
    collection: z.string(),
    id: z.string().optional(),
    index: z.number().int().optional(),
    confirm: z.boolean().default(false),
    expectedHash: z.string().optional(),
  },
}, async ({ collection, id, index, confirm, expectedHash }) => {
  const def = findCollection(collection);
  const doc = await readDoc(def.docId);
  checkHash(doc, expectedHash);
  const arr = [...getArray(doc, def)];
  let pos = def.key === "id" ? arr.findIndex((x) => x?.id === id) : (index ?? -1);
  if (pos < 0 || pos >= arr.length) throw new Error(`Không tìm thấy item để xóa (collection=${collection}, id=${id}, index=${index}).`);
  const removed = arr[pos];
  if (!confirm) return json({ preview: true, collection, willDeletePosition: pos, willDeleteItem: removed, hint: "Gọi lại với confirm:true để xóa." });
  arr.splice(pos, 1);
  const next = await commitArray(def, doc, arr);
  return json({ applied: true, collection, deletedPosition: pos, _hash: hashDoc(next) });
});

// 7) move_item (đổi thứ tự) -----------------------------------------------
server.registerTool("move_item", {
  title: "Move item",
  description: "Đổi thứ tự 1 item trong mảng từ vị trí from -> to (0-based). Mặc định preview; confirm:true để ghi.",
  inputSchema: {
    collection: z.string(),
    from: z.number().int(),
    to: z.number().int(),
    confirm: z.boolean().default(false),
    expectedHash: z.string().optional(),
  },
}, async ({ collection, from, to, confirm, expectedHash }) => {
  const def = findCollection(collection);
  const doc = await readDoc(def.docId);
  checkHash(doc, expectedHash);
  const arr = [...getArray(doc, def)];
  if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) throw new Error(`from/to ngoài phạm vi (0..${arr.length - 1}).`);
  const [it] = arr.splice(from, 1);
  arr.splice(to, 0, it);
  const order = arr.map((x, i) => ({ index: i, label: x?.title ?? x?.label ?? x?.id ?? `item ${i}` }));
  if (!confirm) return json({ preview: true, collection, from, to, newOrder: order, hint: "Gọi lại với confirm:true để áp dụng." });
  const next = await commitArray(def, doc, arr);
  return json({ applied: true, collection, from, to, _hash: hashDoc(next) });
});

// bootstrap ----------------------------------------------------------------
const transport = new StdioServerTransport();
await server.connect(transport);

```


---

## 5. Rủi ro version SDK (đọc nếu build lỗi)
API trên dùng `@modelcontextprotocol/sdk` v1.x với `McpServer.registerTool(name, {title, description, inputSchema}, handler)` trong đó `inputSchema` là **object các zod field** (không phải `z.object(...)`). Nếu major khác:
- Bản cũ có thể dùng `server.tool(name, description, zodShape, handler)`.
- Import path có thể là `.../server/mcp.js` hoặc `.../server/index.js`.
Sau `npm install`, kiểm tra `node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts` để xác nhận chữ ký rồi chỉnh cho khớp. Handler luôn trả `{ content: [{ type: "text", text }] }`.

---

## 6. `mcp-server/README.md` (nội dung cần viết)
Gồm các mục:
1. **Lấy service account:** Firebase Console → Project settings → Service accounts → *Generate new private key* → lưu file vào `mcp-server/service-account.json` (đã gitignore).
2. **Cài & build:**
   ```bash
   cd mcp-server
   cp .env.example .env      # sửa path nếu cần
   npm install
   npm run build
   ```
3. **Cấu hình Claude Desktop** — sửa `claude_desktop_config.json`
   (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`;
    Windows: `%APPDATA%\Claude\claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "portfolio": {
         "command": "node",
         "args": ["/ABS/PATH/mcp-server/dist/index.js"],
         "env": { "FIREBASE_SERVICE_ACCOUNT_PATH": "/ABS/PATH/mcp-server/service-account.json" }
       }
     }
   }
   ```
   Restart Claude Desktop → thấy 7 tool: describe_schema, read_section, list_items, update_section, upsert_item, delete_item, move_item.
4. **Workflow khuyến nghị cho AI:** `describe_schema` → `read_section`/`list_items` (lấy `_hash`) → gọi mutation với `confirm:false` xem preview → gọi lại `confirm:true` (kèm `expectedHash`).
5. Cảnh báo: service-account có full quyền Firestore — không commit, không share.

---

## 7. Verification
1. `cd mcp-server && npm install && npm run build` → TS compile sạch, có `dist/index.js`.
2. **Smoke không cần credential:** `npx @modelcontextprotocol/inspector node dist/index.js`, gọi `describe_schema` → thấy registry đầy đủ. (Các tool đọc/ghi sẽ lỗi thiếu credential — đúng như mong đợi.)
3. **Có service account (local):**
   - `read_section {section:"explore"}` → ra data thật + `_hash`.
   - `list_items {collection:"explore.stories"}` → liệt kê stories.
   - `upsert_item {collection:"explore.stories", item:{title:"Test", content:"hi"}}` (không confirm) → trả preview, KHÔNG ghi. Gọi lại thêm `confirm:true` → ghi; `read_section` lại để xác nhận; rồi `delete_item {collection:"explore.stories", index:<n>, confirm:true}` để dọn.
   - Thử guard: đọc lấy `_hash`, sửa data ở nơi khác, rồi mutation với `expectedHash` cũ → phải báo lỗi "Document đã thay đổi".
4. Gắn vào Claude Desktop theo README, restart, xác nhận 7 tool chạy được.

## 8. Git
- Toàn bộ nằm trong `mcp-server/`, không đụng app.
- Không tạo PR trừ khi user yêu cầu. Commit + push lên branch `claude/stories-section-styling-0ee8xp`.
- Đảm bảo `.gitignore` chặn `service-account.json`, `.env`, `dist`, `node_modules`.

---

## Implementation status
- [x] Package scaffold (`package.json`, `tsconfig`, `.gitignore`, `.env.example`)
- [x] `src/firebase.ts`, `util.ts`, `registry.ts`, `index.ts`
- [x] `README.md`
- [x] `npm install` + `npm run build` (compile OK)
- [ ] Service account local + Claude Desktop wiring (user)
- [ ] Live Firebase smoke tests (needs credentials)
