import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getStringArrayField,
  getStringField,
  parseFrontmatter,
} from "./frontmatter";
import { listMarkdownFiles } from "./markdown-files";
import { resolveContentRoot } from "./content-root";
import { type SimpleEntityListItem } from "./simple-entities";

export type ObjectListItem = SimpleEntityListItem;

export type ObjectStatRange = {
  min: number;
  max: number;
};

export type LoreObjectStats = {
  attack?: ObjectStatRange;
  defense?: ObjectStatRange;
  cdr?: ObjectStatRange;
  maxHp?: ObjectStatRange;
};

export type LoreObject = {
  id: string;
  name: string;
  rarity: string;
  slot: string;
  effectDescription: string;
  sharesEffectWith: string[];
  boosts: string[];
  stats: LoreObjectStats | null;
  image: string | null;
  body: string;
};

type NodeErrorWithCode = Error & { code?: string };

const allowedSlots = new Set([
  "helmet",
  "shoulders",
  "gloves",
  "pants",
  "boots",
]);
const statKeys = ["attack", "defense", "cdr", "max_hp"] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isTypedRef = (value: string): boolean => {
  const firstSeparator = value.indexOf(":");
  if (firstSeparator <= 0 || firstSeparator >= value.length - 1) {
    return false;
  }
  return value.lastIndexOf(":") === firstSeparator;
};

const getObjectsDir = (baseDir?: string): string => {
  const resolvedBaseDir = resolveContentRoot(baseDir);
  return path.join(resolvedBaseDir, "objects");
};

const parseStatRange = (value: unknown, field: string): ObjectStatRange => {
  if (!isRecord(value)) {
    throw new Error(`Invalid ${field}`);
  }
  const min = value.min;
  const max = value.max;
  if (typeof min !== "number" || !Number.isFinite(min)) {
    throw new Error(`Invalid ${field}`);
  }
  if (typeof max !== "number" || !Number.isFinite(max)) {
    throw new Error(`Invalid ${field}`);
  }
  if (min > max) {
    throw new Error(`Invalid ${field}`);
  }
  return { min, max };
};

const parseStats = (value: unknown): LoreObjectStats | null => {
  if (typeof value === "undefined") {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error("Invalid stats");
  }
  if (Object.keys(value).length === 0) {
    throw new Error("Invalid stats");
  }

  const stats: LoreObjectStats = {};
  for (const key of statKeys) {
    if (typeof value[key] === "undefined") {
      continue;
    }
    const range = parseStatRange(value[key], "stats");
    if (key === "max_hp") {
      stats.maxHp = range;
    } else {
      stats[key] = range;
    }
  }

  return stats;
};

const validateTypedRefs = (refs: string[], field: string): string[] => {
  if (!refs.every(isTypedRef)) {
    throw new Error(`Invalid ${field}`);
  }
  return refs;
};

const parseAndValidateObjectMarkdown = (markdown: string): LoreObject => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== "object") {
    throw new Error("Invalid type");
  }

  const id = getStringField(data, "id");
  const name = getStringField(data, "name");
  const rarity = getStringField(data, "rarity");
  const slot = getStringField(data, "slot");
  const effectDescription = getStringField(data, "effect_description");
  const sharesEffectWith = validateTypedRefs(
    getStringArrayField(data, "shares_effect_with"),
    "shares_effect_with",
  );
  const boosts = validateTypedRefs(
    getStringArrayField(data, "boosts"),
    "boosts",
  );
  const stats = parseStats(data.stats);
  const image = typeof data.image === "string" ? data.image : null;

  if (!allowedSlots.has(slot)) {
    throw new Error("Invalid slot");
  }

  return {
    id,
    name,
    rarity,
    slot,
    effectDescription,
    sharesEffectWith,
    boosts,
    stats,
    image,
    body: content,
  };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === "ENOENT";

const readObjectFromFile = async (
  objectsDir: string,
  filename: string,
): Promise<LoreObject> => {
  const filePath = path.join(objectsDir, filename);
  const markdown = await readFile(filePath, "utf8");
  return parseAndValidateObjectMarkdown(markdown);
};

export async function listObjects(
  baseDir?: string,
): Promise<Array<ObjectListItem>> {
  const objectsDir = getObjectsDir(baseDir);
  const markdownFiles = await listMarkdownFiles(objectsDir);

  const objects: ObjectListItem[] = [];
  for (const filename of markdownFiles) {
    const { id, name } = await readObjectFromFile(objectsDir, filename);
    objects.push({ id, name });
  }

  objects.sort((a, b) => a.id.localeCompare(b.id));
  return objects;
}

export async function getObjectById(
  id: string,
  baseDir?: string,
): Promise<LoreObject | null> {
  const objectsDir = getObjectsDir(baseDir);

  try {
    return await readObjectFromFile(objectsDir, `${id}.md`);
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }
}
