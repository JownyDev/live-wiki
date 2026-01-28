import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getStringArrayField,
  getStringField,
  parseFrontmatter,
} from "./frontmatter";
import { listMarkdownFiles } from "./markdown-files";
import { type SimpleEntityListItem } from "./simple-entities";

export type MechanicListItem = SimpleEntityListItem;
export type Mechanic = {
  id: string;
  name: string;
  relatedElements: string[];
  image: string | null;
  body: string;
};

type NodeErrorWithCode = Error & { code?: string };

const getMechanicsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), "content");
  return path.join(resolvedBaseDir, "mechanics");
};

const parseAndValidateMechanicMarkdown = (markdown: string): Mechanic => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== "mechanic") {
    throw new Error("Invalid type");
  }

  const id = getStringField(data, "id");
  const name = getStringField(data, "name");
  const relatedElements = getStringArrayField(data, "related_elements");
  const image = typeof data.image === "string" ? data.image : null;

  return { id, name, relatedElements, image, body: content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === "ENOENT";

const readMechanicFromFile = async (
  mechanicsDir: string,
  filename: string,
): Promise<Mechanic> => {
  const filePath = path.join(mechanicsDir, filename);
  const markdown = await readFile(filePath, "utf8");
  return parseAndValidateMechanicMarkdown(markdown);
};

export async function listMechanics(
  baseDir?: string,
): Promise<Array<MechanicListItem>> {
  const mechanicsDir = getMechanicsDir(baseDir);
  const markdownFiles = await listMarkdownFiles(mechanicsDir);

  const mechanics: MechanicListItem[] = [];
  for (const filename of markdownFiles) {
    const { id, name } = await readMechanicFromFile(mechanicsDir, filename);
    mechanics.push({ id, name });
  }

  mechanics.sort((a, b) => a.id.localeCompare(b.id));
  return mechanics;
}

export async function getMechanicById(
  id: string,
  baseDir?: string,
): Promise<Mechanic | null> {
  const mechanicsDir = getMechanicsDir(baseDir);

  try {
    return await readMechanicFromFile(mechanicsDir, `${id}.md`);
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }
}
