import path from "node:path";
import { readFileSync } from "node:fs";

export const CONTENT_DIR_ENV = "LORE_CONTENT_DIR";

const readEnvValueFromDotEnv = (cwd: string, key: string): string | null => {
  const envFilePath = path.resolve(cwd, ".env");

  try {
    const envFile = readFileSync(envFilePath, "utf8");
    const lines = envFile.split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.length === 0 || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");
      if (separatorIndex < 1) {
        continue;
      }

      const candidateKey = line.slice(0, separatorIndex).trim();
      if (candidateKey !== key) {
        continue;
      }

      const rawValue = line.slice(separatorIndex + 1).trim();
      const quotedWithDouble =
        rawValue.startsWith('"') && rawValue.endsWith('"') && rawValue.length >= 2;
      const quotedWithSingle =
        rawValue.startsWith("'") && rawValue.endsWith("'") && rawValue.length >= 2;

      return quotedWithDouble || quotedWithSingle
        ? rawValue.slice(1, -1)
        : rawValue;
    }
  } catch {
    return null;
  }

  return null;
};

export const resolveDefaultContentDir = (cwd: string = process.cwd()): string => {
  const envValue = process.env[CONTENT_DIR_ENV];
  if (typeof envValue === "string" && envValue.length > 0) {
    return path.resolve(cwd, envValue);
  }

  const envFileValue = readEnvValueFromDotEnv(cwd, CONTENT_DIR_ENV);
  if (typeof envFileValue === "string" && envFileValue.length > 0) {
    return path.resolve(cwd, envFileValue);
  }

  return path.resolve(cwd, "content");
};
