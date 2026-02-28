import path from "node:path";

export const CONTENT_DIR_ENV = "LORE_CONTENT_DIR";

export const resolveDefaultContentDir = (): string => {
  const envValue = process.env[CONTENT_DIR_ENV];
  if (typeof envValue === "string" && envValue.length > 0) {
    return path.resolve(process.cwd(), envValue);
  }

  return path.resolve(process.cwd(), "content");
};
