import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const loadContentDir = async (): Promise<{
  resolveDefaultContentDir: () => string;
}> => {
  return (await import("../packages/wiki-cli/src/content-dir")) as {
    resolveDefaultContentDir: () => string;
  };
};

const ORIGINAL_ENV = process.env.LORE_CONTENT_DIR;

afterEach(() => {
  if (typeof ORIGINAL_ENV === "string") {
    process.env.LORE_CONTENT_DIR = ORIGINAL_ENV;
  } else {
    delete process.env.LORE_CONTENT_DIR;
  }
});

describe("wiki-cli content directory resolver", () => {
  it("uses LORE_CONTENT_DIR when available", async () => {
    process.env.LORE_CONTENT_DIR = "../private-lore/project-b/content";
    const { resolveDefaultContentDir } = await loadContentDir();

    expect(resolveDefaultContentDir()).toBe(
      path.resolve(process.cwd(), "../private-lore/project-b/content"),
    );
  });

  it("falls back to ./content when env is missing", async () => {
    delete process.env.LORE_CONTENT_DIR;
    const { resolveDefaultContentDir } = await loadContentDir();

    expect(resolveDefaultContentDir()).toBe(
      path.resolve(process.cwd(), "content"),
    );
  });
});
