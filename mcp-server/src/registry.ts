export type SectionId = "explore" | "homepage" | "projects" | "products";

export interface CollectionDef {
  name: string; // tool collection name, e.g. "explore.stories"
  docId: SectionId; // parent Firestore document
  arrayPath: string; // path to array in doc: "items" | "stories" | ...
  key: "id" | "index"; // how items are identified
  description: string;
  itemShape: string; // short field shape for the model
}

export const SECTIONS: Record<SectionId, string> = {
  explore:
    "Explore page: intro, achievements, currently, favourites, beyondCode, stories, whatsNext, impactPeople, lessonsFailed, offTheRecord, moreAndMore, hiddenSections.",
  homepage: "Homepage: hero, skillCategories, links, experiences.",
  projects: "Projects list: { items: Project[] }.",
  products: "Products list: { items: Project[] } (same Project shape).",
};

export const COLLECTIONS: CollectionDef[] = [
  {
    name: "projects",
    docId: "projects",
    arrayPath: "items",
    key: "id",
    description: "Projects. Items keyed by unique `id`.",
    itemShape:
      "Project: id, title, description, status(Production|Staging|In Development|Concept|Retired), tags[], topics?[], roles?[], keyFeatures?[], fullDescription?, storyBehind?, githubUrl?, liveUrl?, iconUrl?, imageUrl?, images?[], hidden?, + multilingual *Vi/*Ar fields.",
  },
  {
    name: "products",
    docId: "products",
    arrayPath: "items",
    key: "id",
    description: "Products. Same Project shape, keyed by `id`.",
    itemShape: "Same as Project.",
  },
  {
    name: "explore.stories",
    docId: "explore",
    arrayPath: "stories",
    key: "index",
    description: "Stories on Explore. Keyed by 0-based index.",
    itemShape: "{ title, content, topics?[] }",
  },
  {
    name: "explore.beyondCode",
    docId: "explore",
    arrayPath: "beyondCode",
    key: "index",
    description: "Skills Beyond Code. Keyed by index.",
    itemShape: "ExploreItem: { title, summary, story, since?, imageUrl?, tags?[] }",
  },
  {
    name: "explore.achievements",
    docId: "explore",
    arrayPath: "achievements",
    key: "index",
    description: "Achievements. Keyed by index.",
    itemShape: "{ title, issuer, date, description?, url?, imageUrl? }",
  },
  {
    name: "explore.favourites",
    docId: "explore",
    arrayPath: "favourites",
    key: "index",
    description: "Favourites. Keyed by index.",
    itemShape: "{ label, description? }",
  },
  {
    name: "explore.currently",
    docId: "explore",
    arrayPath: "currently",
    key: "index",
    description: "Currently. Keyed by index.",
    itemShape: "{ label, value }",
  },
  {
    name: "explore.moreAndMore",
    docId: "explore",
    arrayPath: "moreAndMore",
    key: "index",
    description: "My Resumé / More & More. Keyed by index.",
    itemShape: "{ label, description?, url? }",
  },
  {
    name: "explore.whatsNext",
    docId: "explore",
    arrayPath: "whatsNext",
    key: "index",
    description: "What's Next. Keyed by index.",
    itemShape: '{ title, description?, status(Planning|In Progress|Done) }',
  },
  {
    name: "explore.impactPeople",
    docId: "explore",
    arrayPath: "impactPeople",
    key: "index",
    description: "Impact / People. Keyed by index.",
    itemShape: "ExploreItem",
  },
  {
    name: "explore.lessonsFailed",
    docId: "explore",
    arrayPath: "lessonsFailed",
    key: "index",
    description: "Lessons / Failed. Keyed by index.",
    itemShape: "ExploreItem",
  },
  {
    name: "explore.offTheRecord",
    docId: "explore",
    arrayPath: "offTheRecord",
    key: "index",
    description: "Off the Record. Keyed by index.",
    itemShape: "ExploreItem",
  },
];

export function findCollection(name: string): CollectionDef {
  const c = COLLECTIONS.find((x) => x.name === name);
  if (!c) {
    throw new Error(
      `Invalid collection: "${name}". Valid: ${COLLECTIONS.map((c) => c.name).join(", ")}`
    );
  }
  return c;
}

/** Get the item array from a doc using CollectionDef. */
export function getArray(doc: Record<string, any>, def: CollectionDef): any[] {
  return Array.isArray(doc[def.arrayPath]) ? doc[def.arrayPath] : [];
}
