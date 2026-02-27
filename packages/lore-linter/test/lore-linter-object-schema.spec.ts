import path from "node:path";
import { describe, expect, it } from "vitest";

type SchemaError = import("../src/schema-validation").SchemaError;
type LoreLinter = typeof import("../src/index");

const loadLoreLinter = async (): Promise<LoreLinter> => {
  return await import("../src/index");
};

const sortSchemaErrors = (errors: SchemaError[]): SchemaError[] => {
  return [...errors].sort((a, b) => {
    const keyA = `${a.type}:${a.id ?? "none"}:${a.field}:${a.reason}`;
    const keyB = `${b.type}:${b.id ?? "none"}:${b.field}:${b.reason}`;
    return keyA.localeCompare(keyB);
  });
};

describe("lore-linter object schema (RED)", () => {
  it("accepts valid object fixtures", async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      "fixtures",
      "schema-object-valid",
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.schemaErrors).toEqual([]);
  });

  it("reports object schema validation errors", async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      "fixtures",
      "schema-object-invalid",
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    const expected: SchemaError[] = [
      {
        type: "object",
        id: null,
        field: "id",
        reason: "required",
      },
      {
        type: "object",
        id: "object-missing-slot",
        field: "slot",
        reason: "required",
      },
      {
        type: "object",
        id: "object-missing-boosts",
        field: "boosts",
        reason: "required",
      },
      {
        type: "object",
        id: "object-invalid-slot",
        field: "slot",
        reason: "invalid-value",
      },
      {
        type: "object",
        id: "object-stats-not-object",
        field: "stats",
        reason: "invalid-shape",
      },
      {
        type: "object",
        id: "object-stats-empty",
        field: "stats",
        reason: "invalid-value",
      },
      {
        type: "object",
        id: "object-stat-missing-max",
        field: "stats",
        reason: "invalid-shape",
      },
      {
        type: "object",
        id: "object-stat-min-greater-max",
        field: "stats",
        reason: "invalid-value",
      },
      {
        type: "object",
        id: "object-invalid-shares-effect-ref",
        field: "shares_effect_with",
        reason: "invalid-reference",
      },
      {
        type: "object",
        id: "object-boosts-not-array",
        field: "boosts",
        reason: "invalid-shape",
      },
      {
        type: "object",
        id: "object-boosts-item-not-string",
        field: "boosts",
        reason: "invalid-shape",
      },
    ];

    expect(sortSchemaErrors(report.schemaErrors)).toEqual(
      sortSchemaErrors(expected),
    );
  });
});
