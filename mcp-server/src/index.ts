#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readDoc, writeDoc } from "./firebase.js";
import { hashDoc, deepMerge, cleanProjectItem, json } from "./util.js";
import { SECTIONS, COLLECTIONS, findCollection, getArray } from "./registry.js";

const server = new McpServer({ name: "portfolio-mcp", version: "1.0.0" });

const sectionEnum = z.enum(["explore", "homepage", "projects", "products"]);

// Write array back into doc (cleanProjectItem for projects/products)
async function commitArray(
  def: ReturnType<typeof findCollection>,
  doc: Record<string, any>,
  arr: any[]
) {
  const finalArr =
    def.docId === "projects" || def.docId === "products" ? arr.map(cleanProjectItem) : arr;
  const next = { ...doc, [def.arrayPath]: finalArr };
  await writeDoc(def.docId, next);
  return next;
}

function checkHash(doc: Record<string, any>, expectedHash?: string) {
  if (expectedHash && expectedHash !== hashDoc(doc)) {
    throw new Error(
      "Document changed since last read. Call read_section again, then retry."
    );
  }
}

// 1) describe_schema -------------------------------------------------------
server.registerTool(
  "describe_schema",
  {
    title: "Describe schema",
    description:
      "Returns the full portfolio data structure (sections + collections + keying + preview→confirm rules). CALL THIS FIRST before editing so you understand context.",
    inputSchema: {},
  },
  async () =>
    json({
      storage:
        "Firebase Firestore, collection 'siteConfig'; each page is one document.",
      sections: SECTIONS,
      collections: COLLECTIONS,
      writeRules:
        "All write/delete tools return a PREVIEW by default. Call again with confirm:true to apply. Pass expectedHash (from read_section) to avoid overwriting stale data.",
    })
);

// 2) read_section ----------------------------------------------------------
server.registerTool(
  "read_section",
  {
    title: "Read section",
    description:
      "Read the full document for one section. Returns _hash (use as expectedHash when writing).",
    inputSchema: { section: sectionEnum },
  },
  async ({ section }) => {
    const doc = await readDoc(section);
    return json({ section, _hash: hashDoc(doc), data: doc });
  }
);

// 3) list_items ------------------------------------------------------------
server.registerTool(
  "list_items",
  {
    title: "List items",
    description:
      "List items in a collection (with index/id + short label) so you can target the right item to edit/delete.",
    inputSchema: {
      collection: z
        .string()
        .describe("e.g. projects, products, explore.stories"),
    },
  },
  async ({ collection }) => {
    const def = findCollection(collection);
    const doc = await readDoc(def.docId);
    const arr = getArray(doc, def);
    const items = arr.map((it, i) => ({
      index: i,
      id: def.key === "id" ? it?.id : undefined,
      label: it?.title ?? it?.label ?? it?.role ?? `item ${i}`,
    }));
    return json({
      collection,
      key: def.key,
      _hash: hashDoc(doc),
      count: items.length,
      items,
    });
  }
);

// 4) update_section --------------------------------------------------------
server.registerTool(
  "update_section",
  {
    title: "Update section",
    description:
      "Update top-level document fields (e.g. homepage.hero, explore.hiddenSections, explore.intro). mode=merge (deep-merge; arrays are replaced) or replace (overwrite patched top-level fields). Defaults to preview; confirm:true to write.",
    inputSchema: {
      section: sectionEnum,
      patch: z
        .record(z.any())
        .describe("object of top-level document fields to change"),
      mode: z.enum(["merge", "replace"]).default("merge"),
      confirm: z.boolean().default(false),
      expectedHash: z.string().optional(),
    },
  },
  async ({ section, patch, mode, confirm, expectedHash }) => {
    const doc = await readDoc(section);
    checkHash(doc, expectedHash);
    const next = mode === "merge" ? deepMerge(doc, patch) : { ...doc, ...patch };
    if (!confirm) {
      return json({
        preview: true,
        section,
        mode,
        before: doc,
        after: next,
        hint: "Call again with confirm:true to apply.",
      });
    }
    await writeDoc(section, next);
    return json({ applied: true, section, _hash: hashDoc(next), data: next });
  }
);

// 5) upsert_item -----------------------------------------------------------
server.registerTool(
  "upsert_item",
  {
    title: "Upsert item",
    description:
      "Create or update one item in an array collection. Omit id/index to APPEND. With id (key=id) or index (key=index), shallow-merge into that item. Defaults to preview; confirm:true to write.",
    inputSchema: {
      collection: z.string(),
      item: z
        .record(z.any())
        .describe("item object (see collection itemShape)"),
      id: z
        .string()
        .optional()
        .describe("for collections keyed by id (projects/products)"),
      index: z
        .number()
        .int()
        .optional()
        .describe("for collections keyed by index (explore.*)"),
      confirm: z.boolean().default(false),
      expectedHash: z.string().optional(),
    },
  },
  async ({ collection, item, id, index, confirm, expectedHash }) => {
    const def = findCollection(collection);
    const doc = await readDoc(def.docId);
    checkHash(doc, expectedHash);
    const arr = [...getArray(doc, def)];

    let mode: "append" | "update";
    let pos = -1;
    if (def.key === "id") {
      const targetId = id ?? item.id;
      if (targetId != null) pos = arr.findIndex((x) => x?.id === targetId);
      if (pos >= 0) {
        arr[pos] = { ...arr[pos], ...item };
        mode = "update";
      } else {
        if (!item.id) {
          throw new Error("Creating projects/products items requires a unique item.id.");
        }
        arr.push(item);
        pos = arr.length - 1;
        mode = "append";
      }
    } else {
      if (index != null) {
        if (index < 0 || index >= arr.length) {
          throw new Error(`index ${index} out of range (0..${arr.length - 1}).`);
        }
        arr[index] = { ...arr[index], ...item };
        pos = index;
        mode = "update";
      } else {
        arr.push(item);
        pos = arr.length - 1;
        mode = "append";
      }
    }

    if (!confirm) {
      return json({
        preview: true,
        collection,
        mode,
        position: pos,
        resultingItem: arr[pos],
        hint: "Call again with confirm:true to apply.",
      });
    }
    const next = await commitArray(def, doc, arr);
    return json({
      applied: true,
      collection,
      mode,
      position: pos,
      _hash: hashDoc(next),
    });
  }
);

// 6) delete_item -----------------------------------------------------------
server.registerTool(
  "delete_item",
  {
    title: "Delete item",
    description:
      "Delete one item from an array collection by id (key=id) or index (key=index). Defaults to preview; confirm:true to delete.",
    inputSchema: {
      collection: z.string(),
      id: z.string().optional(),
      index: z.number().int().optional(),
      confirm: z.boolean().default(false),
      expectedHash: z.string().optional(),
    },
  },
  async ({ collection, id, index, confirm, expectedHash }) => {
    const def = findCollection(collection);
    const doc = await readDoc(def.docId);
    checkHash(doc, expectedHash);
    const arr = [...getArray(doc, def)];
    const pos =
      def.key === "id" ? arr.findIndex((x) => x?.id === id) : (index ?? -1);
    if (pos < 0 || pos >= arr.length) {
      throw new Error(
        `Item not found to delete (collection=${collection}, id=${id}, index=${index}).`
      );
    }
    const removed = arr[pos];
    if (!confirm) {
      return json({
        preview: true,
        collection,
        willDeletePosition: pos,
        willDeleteItem: removed,
        hint: "Call again with confirm:true to delete.",
      });
    }
    arr.splice(pos, 1);
    const next = await commitArray(def, doc, arr);
    return json({
      applied: true,
      collection,
      deletedPosition: pos,
      _hash: hashDoc(next),
    });
  }
);

// 7) move_item -------------------------------------------------------------
server.registerTool(
  "move_item",
  {
    title: "Move item",
    description:
      "Reorder one item in an array from `from` → `to` (0-based). Defaults to preview; confirm:true to write.",
    inputSchema: {
      collection: z.string(),
      from: z.number().int(),
      to: z.number().int(),
      confirm: z.boolean().default(false),
      expectedHash: z.string().optional(),
    },
  },
  async ({ collection, from, to, confirm, expectedHash }) => {
    const def = findCollection(collection);
    const doc = await readDoc(def.docId);
    checkHash(doc, expectedHash);
    const arr = [...getArray(doc, def)];
    if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) {
      throw new Error(`from/to out of range (0..${arr.length - 1}).`);
    }
    const [it] = arr.splice(from, 1);
    arr.splice(to, 0, it);
    const order = arr.map((x, i) => ({
      index: i,
      label: x?.title ?? x?.label ?? x?.id ?? `item ${i}`,
    }));
    if (!confirm) {
      return json({
        preview: true,
        collection,
        from,
        to,
        newOrder: order,
        hint: "Call again with confirm:true to apply.",
      });
    }
    const next = await commitArray(def, doc, arr);
    return json({ applied: true, collection, from, to, _hash: hashDoc(next) });
  }
);

// bootstrap ----------------------------------------------------------------
const transport = new StdioServerTransport();
await server.connect(transport);
