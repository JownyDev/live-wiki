import path from "node:path";
import os from "node:os";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

const loadContentDir = async (): Promise<{
  resolveDefaultContentDir: (cwd?: string) => string;
}> => {
  return (await import("../packages/wiki-cli/src/content-dir")) as {
    resolveDefaultContentDir: (cwd?: string) => string;
  };
};

const ORIGINAL_ENV = process.env.LORE_CONTENT_DIR;
const createdTempDirs: string[] = [];

const createTempDir = (): string => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "live-wiki-cli-content-dir-"));
  createdTempDirs.push(dir);
  return dir;
};

afterEach(() => {
  if (typeof ORIGINAL_ENV === "string") {
    process.env.LORE_CONTENT_DIR = ORIGINAL_ENV;
  } else {
    delete process.env.LORE_CONTENT_DIR;
  }

  for (const tempDir of createdTempDirs.splice(0, createdTempDirs.length)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("wiki-cli content directory resolver", () => {
  it("uses LORE_CONTENT_DIR when available", async () => {
    process.env.LORE_CONTENT_DIR = "../private-lore/project-b/content";
    const { resolveDefaultContentDir } = await loadContentDir();
    const tempDir = createTempDir();

    expect(resolveDefaultContentDir(tempDir)).toBe(
      path.resolve(tempDir, "../private-lore/project-b/content"),
    );
  });

  it("uses .env LORE_CONTENT_DIR when process env is missing", async () => {
    delete process.env.LORE_CONTENT_DIR;
    const { resolveDefaultContentDir } = await loadContentDir();
    const tempDir = createTempDir();
    writeFileSync(
      path.resolve(tempDir, ".env"),
      "LORE_CONTENT_DIR=../private-lore/project-env/content\n",
      "utf8",
    );

    expect(resolveDefaultContentDir(tempDir)).toBe(
      path.resolve(tempDir, "../private-lore/project-env/content"),
    );
  });

  it("falls back to ./content when env is missing", async () => {
    delete process.env.LORE_CONTENT_DIR;
    const { resolveDefaultContentDir } = await loadContentDir();
    const tempDir = createTempDir();

    expect(resolveDefaultContentDir(tempDir)).toBe(path.resolve(tempDir, "content"));
  });
});
