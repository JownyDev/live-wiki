import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type CharacterFixtureName =
  | "capabilities-valid.md"
  | "emotions-profile-valid.md"
  | "goals-valid.md"
  | "kael-nyx.md"
  | "knowledge-valid.md"
  | "memory-profile-valid.md"
  | "persona-valid.md"
  | "origin-absent.md"
  | "origin-invalid.md"
  | "origin-null.md"
  | "origin-place.md"
  | "origin-space.md"
  | "origin-unknown.md"
  | "invalid-missing-name.md"
  | "invalid-wrong-type.md"
  | "invalid-missing-id.md";

export const getCharactersFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "characters");
};

export type ElementFixtureName =
  | "amber-shard.md"
  | "flux-core.md"
  | "invalid-missing-id.md"
  | "invalid-missing-name.md"
  | "invalid-wrong-type.md";

export const getElementsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "elements");
};

export type MechanicFixtureName =
  | "chrono-loop.md"
  | "drift-gate.md"
  | "invalid-missing-id.md"
  | "invalid-missing-name.md"
  | "invalid-missing-type.md"
  | "invalid-wrong-type.md";

export const getMechanicsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "mechanics");
};

export type AbilityFixtureName =
  | "herencia-del-ultimo-aliento.md"
  | "sello-de-rutina.md"
  | "vortice-hematomorfo.md"
  | "invalid-missing-id.md"
  | "invalid-missing-name.md"
  | "invalid-missing-related-character.md"
  | "invalid-missing-type.md"
  | "invalid-related-character-reference.md"
  | "invalid-wrong-type.md";

export const getAbilitiesFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "abilities");
};

export type ObjectFixtureName =
  | "aegis-bastion.md"
  | "swift-gloves.md"
  | "invalid-missing-id.md"
  | "invalid-missing-name.md"
  | "invalid-missing-slot.md"
  | "invalid-stats-shape.md"
  | "invalid-typed-ref.md"
  | "invalid-wrong-type.md";

export const getObjectsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "objects");
};

export type CardFixtureName =
  | "ember-echo.md"
  | "invalid-elements-length.md"
  | "invalid-elements-missing-ref.md"
  | "invalid-missing-elements.md"
  | "invalid-missing-id.md"
  | "invalid-missing-name.md"
  | "invalid-represents-element.md"
  | "invalid-represents-prefix.md"
  | "invalid-wrong-type.md"
  | "prism-ward.md"
  | "silent-crest.md";

export const getCardsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "cards");
};

export type EventFixtureName =
  | "first-contact.md"
  | "signal-rift.md"
  | "header-duplicate.md"
  | "invalid-who.md"
  | "invalid-locations.md"
  | "invalid-wrong-type.md"
  | "invalid-date.md"
  | "invalid-missing-id.md"
  | "invalid-missing-title.md";

export const getEventsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "events");
};

export type EventByCharacterFixtureName =
  | "alpha-sighting.md"
  | "relay-run.md"
  | "silent-interval.md";

export const getEventsByCharacterFixtureBaseDir = (): string => {
  return path.resolve(
    import.meta.dirname,
    "..",
    "fixtures",
    "events-by-character",
  );
};

export type EventByLocationFixtureName =
  | "aurora-summit.md"
  | "borealis-skirmish.md"
  | "deep-space-drift.md"
  | "double-sighting.md"
  | "market-uprising.md"
  | "plaza-accord.md";

export const getEventsByLocationFixtureBaseDir = (): string => {
  return path.resolve(
    import.meta.dirname,
    "..",
    "fixtures",
    "events-by-location",
  );
};

export type PlaceFixtureName =
  | "haven-docks.md"
  | "invalid-wrong-type.md"
  | "invalid-missing-id.md"
  | "invalid-missing-name.md";

export const getPlacesFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "places");
};

export type PlaceByLocationFixtureName =
  | "drifter-hub.md"
  | "harbor-south.md"
  | "rift-outpost.md"
  | "skyline-plaza.md";

export const getPlacesByLocationFixtureBaseDir = (): string => {
  return path.resolve(
    import.meta.dirname,
    "..",
    "fixtures",
    "events-by-location",
  );
};

export type PlanetFixtureName =
  | "varda-prime.md"
  | "invalid-wrong-type.md"
  | "invalid-missing-id.md"
  | "invalid-missing-name.md";

export const getPlanetsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "planets");
};

export type SearchCharacterFixtureName = "lira-vox.md" | "tovin-ash.md";

export type SearchEventFixtureName = "glow-harvest.md";

export type SearchPlaceFixtureName = "cinder-dock.md";

export type SearchPlanetFixtureName = "varda-prime.md";

export type SearchElementFixtureName = "ember-shard.md";

export type SearchMechanicFixtureName = "flux-weave.md";

export type SearchCardFixtureName = "prism-ward.md";

export type SearchAbilityFixtureName = "herencia-del-ultimo-aliento.md";

export const getSearchFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, "..", "fixtures", "search");
};

export type PlanetByLocationFixtureName =
  | "aurora.md"
  | "borealis.md"
  | "cinder.md";

export const getPlanetsByLocationFixtureBaseDir = (): string => {
  return path.resolve(
    import.meta.dirname,
    "..",
    "fixtures",
    "events-by-location",
  );
};

export const createTempBaseDirWithCharacterFixtures = async (
  fixtureNames: readonly CharacterFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const charactersDir = path.join(tempBaseDir, "characters");
  await mkdir(charactersDir, { recursive: true });

  const fixtureBaseDir = getCharactersFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, "characters", fixtureName);
    const destPath = path.join(charactersDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithElementFixtures = async (
  fixtureNames: readonly ElementFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const elementsDir = path.join(tempBaseDir, "elements");
  await mkdir(elementsDir, { recursive: true });

  const fixtureBaseDir = getElementsFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, "elements", fixtureName);
    const destPath = path.join(elementsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithMechanicFixtures = async (
  fixtureNames: readonly MechanicFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const mechanicsDir = path.join(tempBaseDir, "mechanics");
  await mkdir(mechanicsDir, { recursive: true });

  const fixtureBaseDir = getMechanicsFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, "mechanics", fixtureName);
    const destPath = path.join(mechanicsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithAbilityFixtures = async (
  fixtureNames: readonly AbilityFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const abilitiesDir = path.join(tempBaseDir, "abilities");
  await mkdir(abilitiesDir, { recursive: true });

  const fixtureBaseDir = getAbilitiesFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, "abilities", fixtureName);
    const destPath = path.join(abilitiesDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithObjectFixtures = async (
  fixtureNames: readonly ObjectFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const objectsDir = path.join(tempBaseDir, "objects");
  await mkdir(objectsDir, { recursive: true });

  const fixtureBaseDir = getObjectsFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, "objects", fixtureName);
    const destPath = path.join(objectsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithCardFixtures = async (
  cardFixtures: readonly CardFixtureName[],
  elementFixtures: readonly ElementFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const cardsDir = path.join(tempBaseDir, "cards");
  const elementsDir = path.join(tempBaseDir, "elements");
  await mkdir(cardsDir, { recursive: true });
  await mkdir(elementsDir, { recursive: true });

  const cardsFixtureBaseDir = getCardsFixtureBaseDir();
  for (const fixtureName of cardFixtures) {
    const sourcePath = path.join(cardsFixtureBaseDir, "cards", fixtureName);
    const destPath = path.join(cardsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  const elementsFixtureBaseDir = getElementsFixtureBaseDir();
  for (const fixtureName of elementFixtures) {
    const sourcePath = path.join(
      elementsFixtureBaseDir,
      "elements",
      fixtureName,
    );
    const destPath = path.join(elementsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithEventFixtures = async (
  fixtureNames: readonly EventFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const eventsDir = path.join(tempBaseDir, "events");
  await mkdir(eventsDir, { recursive: true });

  const fixtureBaseDir = getEventsFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, "events", fixtureName);
    const destPath = path.join(eventsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithEventByCharacterFixtures = async (
  fixtureNames: readonly EventByCharacterFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const eventsDir = path.join(tempBaseDir, "events");
  await mkdir(eventsDir, { recursive: true });

  const fixtureBaseDir = getEventsByCharacterFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, "events", fixtureName);
    const destPath = path.join(eventsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithEventByLocationFixtures = async (
  eventFixtures: readonly EventByLocationFixtureName[],
  placeFixtures: readonly PlaceByLocationFixtureName[],
  planetFixtures: readonly PlanetByLocationFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const eventsDir = path.join(tempBaseDir, "events");
  const placesDir = path.join(tempBaseDir, "places");
  const planetsDir = path.join(tempBaseDir, "planets");
  await mkdir(eventsDir, { recursive: true });
  await mkdir(placesDir, { recursive: true });
  await mkdir(planetsDir, { recursive: true });

  const fixtureBaseDir = getEventsByLocationFixtureBaseDir();
  for (const fixtureName of eventFixtures) {
    const sourcePath = path.join(fixtureBaseDir, "events", fixtureName);
    const destPath = path.join(eventsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  for (const fixtureName of placeFixtures) {
    const sourcePath = path.join(fixtureBaseDir, "places", fixtureName);
    const destPath = path.join(placesDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  for (const fixtureName of planetFixtures) {
    const sourcePath = path.join(fixtureBaseDir, "planets", fixtureName);
    const destPath = path.join(planetsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithPlaceFixtures = async (
  fixtureNames: readonly PlaceFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const placesDir = path.join(tempBaseDir, "places");
  await mkdir(placesDir, { recursive: true });

  const fixtureBaseDir = getPlacesFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, "places", fixtureName);
    const destPath = path.join(placesDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export const createTempBaseDirWithPlanetFixtures = async (
  fixtureNames: readonly PlanetFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const planetsDir = path.join(tempBaseDir, "planets");
  await mkdir(planetsDir, { recursive: true });

  const fixtureBaseDir = getPlanetsFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, "planets", fixtureName);
    const destPath = path.join(planetsDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }

  return tempBaseDir;
};

export type SearchFixtures = {
  characters: readonly SearchCharacterFixtureName[];
  events: readonly SearchEventFixtureName[];
  places: readonly SearchPlaceFixtureName[];
  planets: readonly SearchPlanetFixtureName[];
  elements: readonly SearchElementFixtureName[];
  mechanics: readonly SearchMechanicFixtureName[];
  cards: readonly SearchCardFixtureName[];
  abilities: readonly SearchAbilityFixtureName[];
};

const copySearchFixtures = async (
  tempBaseDir: string,
  fixtureBaseDir: string,
  subdir: string,
  fixtureNames: readonly string[],
): Promise<void> => {
  if (fixtureNames.length === 0) {
    return;
  }
  const destDir = path.join(tempBaseDir, subdir);
  await mkdir(destDir, { recursive: true });

  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, subdir, fixtureName);
    const destPath = path.join(destDir, fixtureName);
    const contents = await readFile(sourcePath, "utf8");
    await writeFile(destPath, contents, "utf8");
  }
};

export const createTempBaseDirWithSearchFixtures = async (
  fixtures: SearchFixtures,
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), "live-wiki-"));
  const fixtureBaseDir = getSearchFixtureBaseDir();

  await copySearchFixtures(
    tempBaseDir,
    fixtureBaseDir,
    "characters",
    fixtures.characters,
  );
  await copySearchFixtures(
    tempBaseDir,
    fixtureBaseDir,
    "events",
    fixtures.events,
  );
  await copySearchFixtures(
    tempBaseDir,
    fixtureBaseDir,
    "places",
    fixtures.places,
  );
  await copySearchFixtures(
    tempBaseDir,
    fixtureBaseDir,
    "planets",
    fixtures.planets,
  );
  await copySearchFixtures(
    tempBaseDir,
    fixtureBaseDir,
    "elements",
    fixtures.elements,
  );
  await copySearchFixtures(
    tempBaseDir,
    fixtureBaseDir,
    "mechanics",
    fixtures.mechanics,
  );
  await copySearchFixtures(
    tempBaseDir,
    fixtureBaseDir,
    "cards",
    fixtures.cards,
  );
  await copySearchFixtures(
    tempBaseDir,
    fixtureBaseDir,
    "abilities",
    fixtures.abilities,
  );

  return tempBaseDir;
};
