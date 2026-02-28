import { describe, expect, it } from "vitest";
import { createTempBaseDirWithObjectFixtures } from "./_utils/fixtures";

const loadObjectsModule = async (): Promise<{
  listObjects: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  getObjectById: (
    id: string,
    baseDir?: string,
  ) => Promise<{
    id: string;
    name: string;
    rarity: string;
    slot: string;
    effectDescription: string;
    sharesEffectWith: string[];
    boosts: string[];
    body: string;
  } | null>;
}> => {
  return (await import("../src/lib/content/objects")) as {
    listObjects: (
      baseDir?: string,
    ) => Promise<Array<{ id: string; name: string }>>;
    getObjectById: (
      id: string,
      baseDir?: string,
    ) => Promise<{
      id: string;
      name: string;
      rarity: string;
      slot: string;
      effectDescription: string;
      sharesEffectWith: string[];
      boosts: string[];
      body: string;
    } | null>;
  };
};

describe("content/objects contract", () => {
  it("listObjects returns objects ordered by id", async () => {
    const baseDir = await createTempBaseDirWithObjectFixtures([
      "swift-gloves.md",
      "aegis-bastion.md",
    ]);
    const { listObjects } = await loadObjectsModule();

    await expect(listObjects(baseDir)).resolves.toEqual([
      { id: "aegis-bastion", name: "Aegis Bastion" },
      { id: "swift-gloves", name: "Swift Gloves" },
    ]);
  });

  it("getObjectById returns object fields and markdown body", async () => {
    const baseDir = await createTempBaseDirWithObjectFixtures([
      "aegis-bastion.md",
    ]);
    const { getObjectById } = await loadObjectsModule();

    const result = await getObjectById("aegis-bastion", baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error("Expected object");
    }
    expect(result).toMatchObject({
      id: "aegis-bastion",
      name: "Aegis Bastion",
      rarity: "epic",
      slot: "helmet",
      effectDescription: "Grants barrier pulses after taking damage.",
    });
    expect(result.sharesEffectWith).toEqual(["mechanic:anchor-mechanic"]);
    expect(result.boosts).toEqual(["character:anchor-hero"]);
    expect(result.body).toContain("protective relic");
  });

  it("getObjectById returns null when the file does not exist", async () => {
    const baseDir = await createTempBaseDirWithObjectFixtures([
      "aegis-bastion.md",
    ]);
    const { getObjectById } = await loadObjectsModule();

    await expect(getObjectById("does-not-exist", baseDir)).resolves.toBeNull();
  });

  it("listObjects throws if it finds a markdown with an incorrect type", async () => {
    const baseDir = await createTempBaseDirWithObjectFixtures([
      "invalid-wrong-type.md",
    ]);
    const { listObjects } = await loadObjectsModule();

    await expect(listObjects(baseDir)).rejects.toThrow();
  });

  it("listObjects throws if it finds a markdown missing name", async () => {
    const baseDir = await createTempBaseDirWithObjectFixtures([
      "invalid-missing-name.md",
    ]);
    const { listObjects } = await loadObjectsModule();

    await expect(listObjects(baseDir)).rejects.toThrow();
  });

  it("listObjects throws if it finds a markdown missing id", async () => {
    const baseDir = await createTempBaseDirWithObjectFixtures([
      "invalid-missing-id.md",
    ]);
    const { listObjects } = await loadObjectsModule();

    await expect(listObjects(baseDir)).rejects.toThrow();
  });

  it("listObjects throws if it finds a markdown missing slot", async () => {
    const baseDir = await createTempBaseDirWithObjectFixtures([
      "invalid-missing-slot.md",
    ]);
    const { listObjects } = await loadObjectsModule();

    await expect(listObjects(baseDir)).rejects.toThrow();
  });

  it("listObjects throws if stats is malformed", async () => {
    const baseDir = await createTempBaseDirWithObjectFixtures([
      "invalid-stats-shape.md",
    ]);
    const { listObjects } = await loadObjectsModule();

    await expect(listObjects(baseDir)).rejects.toThrow();
  });

  it("listObjects throws if a typed ref is malformed", async () => {
    const baseDir = await createTempBaseDirWithObjectFixtures([
      "invalid-typed-ref.md",
    ]);
    const { listObjects } = await loadObjectsModule();

    await expect(listObjects(baseDir)).rejects.toThrow();
  });
});
