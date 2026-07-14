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
