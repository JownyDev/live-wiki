import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveContentRoot } from "./content-root";
import { getStringField, parseFrontmatter } from "./frontmatter";
import { listMarkdownFiles } from "./markdown-files";
import { type SimpleEntityListItem } from "./simple-entities";

export type AbilityListItem = SimpleEntityListItem;
export type Ability = {
  id: string;
  name: string;
  relatedCharacter: string;
  image: string | null;
  body: string;
};

type NodeErrorWithCode = Error & { code?: string };

const getAbilitiesDir = (baseDir?: string): string => {
  const resolvedBaseDir = resolveContentRoot(baseDir);
  return path.join(resolvedBaseDir, "abilities");
};

const parseCharacterRef = (value: string): string | null => {
  const prefix = "character:";
  if (!value.startsWith(prefix)) {
    return null;
  }
  const separator = value.indexOf(":");
  if (separator !== value.lastIndexOf(":")) {
    return null;
  }
  const id = value.slice(prefix.length);
  return id.length > 0 ? id : null;
};

const parseAndValidateAbilityMarkdown = (markdown: string): Ability => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== "ability") {
    throw new Error("Invalid type");
  }

  const id = getStringField(data, "id");
  const name = getStringField(data, "name");
  const relatedCharacter = getStringField(data, "related_character");
  if (!parseCharacterRef(relatedCharacter)) {
    throw new Error("Invalid related_character");
  }
  const image = typeof data.image === "string" ? data.image : null;

  return { id, name, relatedCharacter, image, body: content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === "ENOENT";

const readAbilityFromFile = async (
  abilitiesDir: string,
  filename: string,
): Promise<Ability> => {
  const filePath = path.join(abilitiesDir, filename);
  const markdown = await readFile(filePath, "utf8");
  return parseAndValidateAbilityMarkdown(markdown);
};

export async function listAbilities(
  baseDir?: string,
): Promise<Array<AbilityListItem>> {
  const abilitiesDir = getAbilitiesDir(baseDir);
  const markdownFiles = await listMarkdownFiles(abilitiesDir);

  const abilities: AbilityListItem[] = [];
  for (const filename of markdownFiles) {
    const { id, name } = await readAbilityFromFile(abilitiesDir, filename);
    abilities.push({ id, name });
  }

  abilities.sort((a, b) => a.id.localeCompare(b.id));
  return abilities;
}

export async function listAbilitiesByCharacterId(
  characterId: string,
  baseDir?: string,
): Promise<Array<AbilityListItem>> {
  const abilitiesDir = getAbilitiesDir(baseDir);
  const markdownFiles = await listMarkdownFiles(abilitiesDir);

  const abilities: AbilityListItem[] = [];
  for (const filename of markdownFiles) {
    const ability = await readAbilityFromFile(abilitiesDir, filename);
    const ownerId = parseCharacterRef(ability.relatedCharacter);
    if (ownerId === characterId) {
      abilities.push({ id: ability.id, name: ability.name });
    }
  }

  abilities.sort((a, b) => a.id.localeCompare(b.id));
  return abilities;
}

export async function getAbilityById(
  id: string,
  baseDir?: string,
): Promise<Ability | null> {
  const abilitiesDir = getAbilitiesDir(baseDir);

  try {
    return await readAbilityFromFile(abilitiesDir, `${id}.md`);
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }
}
