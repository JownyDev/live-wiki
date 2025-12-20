import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export type CharacterFixtureName =
  | 'kael-nyx.md'
  | 'invalid-missing-name.md'
  | 'invalid-wrong-type.md'
  | 'invalid-missing-id.md';

export const getCharactersFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'characters');
};

export type EventFixtureName =
  | 'first-contact.md'
  | 'invalid-wrong-type.md'
  | 'invalid-date.md'
  | 'invalid-missing-id.md'
  | 'invalid-missing-title.md';

export const getEventsFixtureBaseDir = (): string => {
  return path.resolve(import.meta.dirname, '..', 'fixtures', 'events');
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
