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
