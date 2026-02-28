import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveContentRoot } from "./content-root";
import { getStringField, parseFrontmatter } from "./frontmatter";
import { parseLocationRef } from "./location-refs";
import {
  listSimpleEntities,
  type SimpleEntity,
  type SimpleEntityListItem,
} from "./simple-entities";

export type Place = SimpleEntity & {
  planetId: string | null;
  locationType: "space" | "planet" | "province" | "unknown" | null;
};

type NodeErrorWithCode = Error & { code?: string };

const getPlacesDir = (baseDir?: string): string => {
  const resolvedBaseDir = resolveContentRoot(baseDir);
  return path.join(resolvedBaseDir, "places");
};

const parseLocationType = (
  value: unknown,
): "space" | "planet" | "province" | "unknown" | null => {
  if (typeof value === "undefined") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error("Invalid locationType");
  }
  if (
    value !== "space" &&
    value !== "planet" &&
    value !== "province" &&
    value !== "unknown"
  ) {
    throw new Error("Invalid locationType");
  }
  return value;
};

const parsePlanetId = (value: unknown): string | null => {
  if (typeof value === "undefined") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error("Invalid planetId");
  }
  const parsed = parseLocationRef(value);
  if (!parsed || parsed.kind !== "planet") {
    throw new Error("Invalid planetId");
  }
  return parsed.id;
};

const parseAndValidatePlaceMarkdown = (markdown: string): Place => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== "place") {
    throw new Error("Invalid type");
  }

  const id = getStringField(data, "id");
  const name = getStringField(data, "name");
  const image = typeof data.image === "string" ? data.image : undefined;
  const planetId = parsePlanetId(data.planetId);
  const locationType = parseLocationType(data.locationType);

  return { id, name, image, planetId, locationType, body: content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === "ENOENT";

export async function listPlaces(
  baseDir?: string,
): Promise<Array<SimpleEntityListItem>> {
  const placesDir = getPlacesDir(baseDir);
  // Reusa el parser basico del MVP para mantener el esquema minimo consistente.
  return await listSimpleEntities(placesDir, "place");
}

export async function getPlaceById(
  id: string,
  baseDir?: string,
): Promise<Place | null> {
  const placesDir = getPlacesDir(baseDir);
  // Parsea planetId/locationType aqui para no acoplar SimpleEntity a localizacion.
  const filePath = path.join(placesDir, `${id}.md`);

  let markdown: string;
  try {
    markdown = await readFile(filePath, "utf8");
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidatePlaceMarkdown(markdown);
}
