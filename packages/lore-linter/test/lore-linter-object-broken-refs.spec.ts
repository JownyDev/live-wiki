import path from "node:path";
import { describe, expect, it } from "vitest";

type BrokenReference = import("../src/broken-references").BrokenReference;
type LoreLinter = typeof import("../src/index");

const loadLoreLinter = async (): Promise<LoreLinter> => {
  return await import("../src/index");
};

const sortBrokenRefs = (refs: BrokenReference[]): BrokenReference[] => {
  return [...refs].sort((a, b) => {
    const keyA = `${a.type}:${a.id}:${a.field}:${a.reference}`;
    const keyB = `${b.type}:${b.id}:${b.field}:${b.reference}`;
    return keyA.localeCompare(keyB);
  });
};

describe("lore-linter object broken references", () => {
  it("reports broken references from shares_effect_with and boosts", async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      "fixtures",
      "broken-refs-object-invalid",
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    const expected: BrokenReference[] = [
      {
        type: "object",
        id: "object-broken-refs",
        field: "shares_effect_with",
        reference: "character:does-not-exist",
      },
      {
        type: "object",
        id: "object-broken-refs",
        field: "boosts",
        reference: "mechanic:missing-mechanic",
      },
    ];

    expect(sortBrokenRefs(report.brokenReferences)).toEqual(
      sortBrokenRefs(expected),
    );
  });

  it("accepts object references when targets exist", async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      "fixtures",
      "broken-refs-object-valid",
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.brokenReferences).toEqual([]);
  });
});
