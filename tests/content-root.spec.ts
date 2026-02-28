import path from "node:path";
import os from "node:os";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

const loadContentRoot = async (): Promise<{
  resolveContentRoot: (baseDir?: string) => string;
}> => {
  return (await import("../src/lib/content/content-root")) as {
    resolveContentRoot: (baseDir?: string) => string;
  };
};

const ORIGINAL_ENV = process.env.LORE_CONTENT_DIR;
const createdTempDirs: string[] = [];

const createTempDir = (): string => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "live-wiki-content-root-"));
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

describe("content root resolver", () => {
  it("uses explicit baseDir when provided", async () => {
    process.env.LORE_CONTENT_DIR = "ignored/by-base-dir";
    const { resolveContentRoot } = await loadContentRoot();

    expect(resolveContentRoot("/tmp/custom-content")).toBe(
      "/tmp/custom-content",
    );
  });

  it("uses LORE_CONTENT_DIR when baseDir is omitted", async () => {
    process.env.LORE_CONTENT_DIR = "../private-lore/project-a/content";
    const { resolveContentRoot } = await loadContentRoot();
    const tempDir = createTempDir();

    expect(resolveContentRoot(undefined, tempDir)).toBe(
      path.resolve(tempDir, "../private-lore/project-a/content"),
    );
  });

  it("uses .env LORE_CONTENT_DIR when process env is missing", async () => {
    delete process.env.LORE_CONTENT_DIR;
    const { resolveContentRoot } = await loadContentRoot();
    const tempDir = createTempDir();
    writeFileSync(
      path.resolve(tempDir, ".env"),
      "LORE_CONTENT_DIR=../private-lore/project-env/content\n",
      "utf8",
    );

    expect(resolveContentRoot(undefined, tempDir)).toBe(
      path.resolve(tempDir, "../private-lore/project-env/content"),
    );
  });

  it("falls back to ./content when env is missing", async () => {
    delete process.env.LORE_CONTENT_DIR;
    const { resolveContentRoot } = await loadContentRoot();
    const tempDir = createTempDir();

    expect(resolveContentRoot(undefined, tempDir)).toBe(
      path.resolve(tempDir, "content"),
    );
  });
});
