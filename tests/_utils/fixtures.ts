import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export type CharacterFixtureName =
  | 'kael-nyx.md'
  | 'origin-absent.md'
  | 'origin-invalid.md'
  | 'origin-null.md'
  | 'origin-place.md'
  | 'origin-space.md'
  | 'origin-unknown.md'
  | 'invalid-missing-name.md'
  | 'invalid-wrong-type.md'
  | 'invalid-missing-id.md';

export const getCharactersFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'characters');
};

export type ElementFixtureName =
  | 'amber-shard.md'
  | 'flux-core.md'
  | 'invalid-missing-id.md'
  | 'invalid-missing-name.md'
  | 'invalid-wrong-type.md';

export const getElementsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'elements');
};

export type EventFixtureName =
  | 'first-contact.md'
  | 'signal-rift.md'
  | 'invalid-who.md'
  | 'invalid-locations.md'
  | 'invalid-wrong-type.md'
  | 'invalid-date.md'
  | 'invalid-missing-id.md'
  | 'invalid-missing-title.md';

export const getEventsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'events');
};

export type EventByCharacterFixtureName =
  | 'alpha-sighting.md'
  | 'relay-run.md'
  | 'silent-interval.md';

export const getEventsByCharacterFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'events-by-character');
};

export type EventByLocationFixtureName =
  | 'aurora-summit.md'
  | 'borealis-skirmish.md'
  | 'deep-space-drift.md'
  | 'double-sighting.md'
  | 'market-uprising.md'
  | 'plaza-accord.md';

export const getEventsByLocationFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'events-by-location');
};

export type PlaceFixtureName =
  | 'haven-docks.md'
  | 'invalid-wrong-type.md'
  | 'invalid-missing-id.md'
  | 'invalid-missing-name.md';

export const getPlacesFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'places');
};

export type PlaceByLocationFixtureName =
  | 'drifter-hub.md'
  | 'harbor-south.md'
  | 'rift-outpost.md'
  | 'skyline-plaza.md';

export const getPlacesByLocationFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'events-by-location');
};

export type PlanetFixtureName =
  | 'varda-prime.md'
  | 'invalid-wrong-type.md'
  | 'invalid-missing-id.md'
  | 'invalid-missing-name.md';

export const getPlanetsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'planets');
};

export type PlanetByLocationFixtureName = 'aurora.md' | 'borealis.md' | 'cinder.md';

export const getPlanetsByLocationFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'events-by-location');
};

export const createTempBaseDirWithCharacterFixtures = async (
  fixtureNames: readonly CharacterFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), 'live-wiki-'));
  const charactersDir = path.join(tempBaseDir, 'characters');
  await mkdir(charactersDir, { recursive: true });

  const fixtureBaseDir = getCharactersFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, 'characters', fixtureName);
    const destPath = path.join(charactersDir, fixtureName);
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(destPath, contents, 'utf8');
  }

  return tempBaseDir;
};

export const createTempBaseDirWithElementFixtures = async (
  fixtureNames: readonly ElementFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), 'live-wiki-'));
  const elementsDir = path.join(tempBaseDir, 'elements');
  await mkdir(elementsDir, { recursive: true });

  const fixtureBaseDir = getElementsFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, 'elements', fixtureName);
    const destPath = path.join(elementsDir, fixtureName);
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(destPath, contents, 'utf8');
  }

  return tempBaseDir;
};

export const createTempBaseDirWithEventFixtures = async (
  fixtureNames: readonly EventFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), 'live-wiki-'));
  const eventsDir = path.join(tempBaseDir, 'events');
  await mkdir(eventsDir, { recursive: true });

  const fixtureBaseDir = getEventsFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, 'events', fixtureName);
    const destPath = path.join(eventsDir, fixtureName);
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(destPath, contents, 'utf8');
  }

  return tempBaseDir;
};

export const createTempBaseDirWithEventByCharacterFixtures = async (
  fixtureNames: readonly EventByCharacterFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), 'live-wiki-'));
  const eventsDir = path.join(tempBaseDir, 'events');
  await mkdir(eventsDir, { recursive: true });

  const fixtureBaseDir = getEventsByCharacterFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, 'events', fixtureName);
    const destPath = path.join(eventsDir, fixtureName);
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(destPath, contents, 'utf8');
  }

  return tempBaseDir;
};

export const createTempBaseDirWithEventByLocationFixtures = async (
  eventFixtures: readonly EventByLocationFixtureName[],
  placeFixtures: readonly PlaceByLocationFixtureName[],
  planetFixtures: readonly PlanetByLocationFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), 'live-wiki-'));
  const eventsDir = path.join(tempBaseDir, 'events');
  const placesDir = path.join(tempBaseDir, 'places');
  const planetsDir = path.join(tempBaseDir, 'planets');
  await mkdir(eventsDir, { recursive: true });
  await mkdir(placesDir, { recursive: true });
  await mkdir(planetsDir, { recursive: true });

  const fixtureBaseDir = getEventsByLocationFixtureBaseDir();
  for (const fixtureName of eventFixtures) {
    const sourcePath = path.join(fixtureBaseDir, 'events', fixtureName);
    const destPath = path.join(eventsDir, fixtureName);
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(destPath, contents, 'utf8');
  }

  for (const fixtureName of placeFixtures) {
    const sourcePath = path.join(fixtureBaseDir, 'places', fixtureName);
    const destPath = path.join(placesDir, fixtureName);
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(destPath, contents, 'utf8');
  }

  for (const fixtureName of planetFixtures) {
    const sourcePath = path.join(fixtureBaseDir, 'planets', fixtureName);
    const destPath = path.join(planetsDir, fixtureName);
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(destPath, contents, 'utf8');
  }

  return tempBaseDir;
};

export const createTempBaseDirWithPlaceFixtures = async (
  fixtureNames: readonly PlaceFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), 'live-wiki-'));
  const placesDir = path.join(tempBaseDir, 'places');
  await mkdir(placesDir, { recursive: true });

  const fixtureBaseDir = getPlacesFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, 'places', fixtureName);
    const destPath = path.join(placesDir, fixtureName);
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(destPath, contents, 'utf8');
  }

  return tempBaseDir;
};

export const createTempBaseDirWithPlanetFixtures = async (
  fixtureNames: readonly PlanetFixtureName[],
): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), 'live-wiki-'));
  const planetsDir = path.join(tempBaseDir, 'planets');
  await mkdir(planetsDir, { recursive: true });

  const fixtureBaseDir = getPlanetsFixtureBaseDir();
  for (const fixtureName of fixtureNames) {
    const sourcePath = path.join(fixtureBaseDir, 'planets', fixtureName);
    const destPath = path.join(planetsDir, fixtureName);
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(destPath, contents, 'utf8');
  }

  return tempBaseDir;
};
