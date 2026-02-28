import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const loadContentRoot = async (): Promise<{
  resolveContentRoot: (baseDir?: string) => string;
}> => {
  return (await import("../src/lib/content/content-root")) as {
    resolveContentRoot: (baseDir?: string) => string;
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

    expect(resolveContentRoot()).toBe(
      path.resolve(process.cwd(), "../private-lore/project-a/content"),
    );
  });

  it("falls back to ./content when env is missing", async () => {
    delete process.env.LORE_CONTENT_DIR;
    const { resolveContentRoot } = await loadContentRoot();

    expect(resolveContentRoot()).toBe(path.resolve(process.cwd(), "content"));
  });
});
