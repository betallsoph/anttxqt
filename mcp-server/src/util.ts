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
