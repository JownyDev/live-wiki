import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { afterEach, describe, expect, it, vi } from 'vitest';

type CommandResult = {
  exitCode: number;
  output: string;
};

type RunCheckCommand = (options: { contentDir: string }) => Promise<unknown>;

type RunSiteBuild = (options: { projectRoot?: string }) => Promise<unknown>;

type BuildDeps = {
  runCheckCommand?: RunCheckCommand;
  runSiteBuild?: RunSiteBuild;
};

type RunBuildCommand = (options: { contentDir: string; deps?: BuildDeps }) => Promise<unknown>;

type RunNewCommand = (options: {
  type: string;
  id: string;
  contentDir: string;
  templatesDir: string;
}) => Promise<unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const loadCommand = async <T>(
  relativePath: string,
  exportName: string,
): Promise<T> => {
  const modulePath = path.resolve(import.meta.dirname, '..', relativePath);
  const moduleUrl = pathToFileURL(modulePath).href;
  const moduleExports = (await import(moduleUrl)) as unknown;
  if (!isRecord(moduleExports)) {
    throw new Error(`Expected module exports for ${relativePath}`);
  }
  const exported = moduleExports[exportName];
  if (typeof exported !== 'function') {
    throw new Error(`Expected ${exportName} export from ${relativePath}`);
  }
  return exported as T;
};

const assertCommandResult = (value: unknown): CommandResult => {
  if (!isRecord(value)) {
    throw new Error('Expected command result object');
  }
  const exitCode = value.exitCode;
  const output = value.output;
  if (typeof exitCode !== 'number' || typeof output !== 'string') {
    throw new Error('Expected command result shape');
  }
  return { exitCode, output };
};

const parseFrontmatter = (contents: string): Record<string, unknown> => {
  const parsed = matter(contents);
  const data = parsed.data as unknown;
  if (!isRecord(data)) {
    throw new Error('Expected frontmatter data');
  }
  return data;
};

const createTempContentDir = async (): Promise<string> => {
  const tempBaseDir = await mkdtemp(path.join(os.tmpdir(), 'live-wiki-cli-'));
  const contentDir = path.join(tempBaseDir, 'content');
  await mkdir(contentDir, { recursive: true });
  return contentDir;
};

const getFixturesDir = (fixtureName: string): string => {
  return path.resolve(
    import.meta.dirname,
    '..',
    'packages',
    'wiki-cli',
    'test',
    'fixtures',
    fixtureName,
  );
};

const getTemplatesDir = (): string => getFixturesDir('templates');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('wiki check command', () => {
  it('returns exit 0 for ok fixtures', async () => {
    const runCheckCommand = await loadCommand<RunCheckCommand>(
      'packages/wiki-cli/src/commands/check.ts',
      'runCheckCommand',
    );
    const fixturesDir = getFixturesDir('content-ok');

    const result = assertCommandResult(
      await runCheckCommand({ contentDir: fixturesDir }),
    );

    expect(result.exitCode).toBe(0);
  });

  it('returns exit 1 and prints error for broken fixtures', async () => {
    const runCheckCommand = await loadCommand<RunCheckCommand>(
      'packages/wiki-cli/src/commands/check.ts',
      'runCheckCommand',
    );
    const fixturesDir = getFixturesDir('content-broken');

    const result = assertCommandResult(
      await runCheckCommand({ contentDir: fixturesDir }),
    );

    expect(result.exitCode).toBe(1);
    expect(result.output.toLowerCase()).toContain('error');
  });
});

describe('wiki build command', () => {
  it('fails and skips build when check fails', async () => {
    const runBuildCommand = await loadCommand<RunBuildCommand>(
      'packages/wiki-cli/src/commands/build.ts',
      'runBuildCommand',
    );

    const runCheckCommand = vi
      .fn<RunCheckCommand>()
      .mockResolvedValue({ exitCode: 1, output: 'error' });
    const runSiteBuild = vi
      .fn<RunSiteBuild>()
      .mockResolvedValue({ exitCode: 0, output: 'ok' });

    const result = assertCommandResult(
      await runBuildCommand({
        contentDir: getFixturesDir('content-broken'),
        deps: { runCheckCommand, runSiteBuild },
      }),
    );

    expect(result.exitCode).toBe(1);
    expect(runCheckCommand).toHaveBeenCalledOnce();
    expect(runSiteBuild).not.toHaveBeenCalled();
  });

  it('runs build when check passes', async () => {
    const runBuildCommand = await loadCommand<RunBuildCommand>(
      'packages/wiki-cli/src/commands/build.ts',
      'runBuildCommand',
    );

    const runCheckCommand = vi
      .fn<RunCheckCommand>()
      .mockResolvedValue({ exitCode: 0, output: 'ok' });
    const runSiteBuild = vi
      .fn<RunSiteBuild>()
      .mockResolvedValue({ exitCode: 0, output: 'ok' });

    const result = assertCommandResult(
      await runBuildCommand({
        contentDir: getFixturesDir('content-ok'),
        deps: { runCheckCommand, runSiteBuild },
      }),
    );

    expect(result.exitCode).toBe(0);
    expect(runCheckCommand).toHaveBeenCalledOnce();
    expect(runSiteBuild).toHaveBeenCalledOnce();
  });
});

describe('wiki new command', () => {
  it('creates a character file with minimal frontmatter', async () => {
    const runNewCommand = await loadCommand<RunNewCommand>(
      'packages/wiki-cli/src/commands/new.ts',
      'runNewCommand',
    );
    const contentDir = await createTempContentDir();
    const templatesDir = getTemplatesDir();

    const result = assertCommandResult(
      await runNewCommand({
        type: 'character',
        id: 'kael-nyx',
        contentDir,
        templatesDir,
      }),
    );

    expect(result.exitCode).toBe(0);
    const filePath = path.join(contentDir, 'characters', 'kael-nyx.md');
    const contents = await readFile(filePath, 'utf8');
    const data = parseFrontmatter(contents);

    expect(data.type).toBe('character');
    expect(data.id).toBe('kael-nyx');
    const name = data.name;
    expect(typeof name).toBe('string');
    if (typeof name !== 'string') {
      throw new Error('Expected character name');
    }
    expect(name.length).toBeGreaterThan(0);
    expect(data.origin).toBe('unknown');
  });

  it('creates an event file with who and locations placeholders', async () => {
    const runNewCommand = await loadCommand<RunNewCommand>(
      'packages/wiki-cli/src/commands/new.ts',
      'runNewCommand',
    );
    const contentDir = await createTempContentDir();
    const templatesDir = getTemplatesDir();

    const result = assertCommandResult(
      await runNewCommand({
        type: 'event',
        id: 'batalla-1',
        contentDir,
        templatesDir,
      }),
    );

    expect(result.exitCode).toBe(0);
    const filePath = path.join(contentDir, 'events', 'batalla-1.md');
    const contents = await readFile(filePath, 'utf8');
    const data = parseFrontmatter(contents);

    expect(data.type).toBe('event');
    expect(data.id).toBe('batalla-1');
    const title = data.title;
    expect(typeof title).toBe('string');
    if (typeof title !== 'string') {
      throw new Error('Expected event title');
    }
    expect(title.length).toBeGreaterThan(0);
    const date = data.date;
    expect(typeof date).toBe('string');
    if (typeof date !== 'string') {
      throw new Error('Expected event date');
    }
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    expect(Array.isArray(data.who)).toBe(true);
    expect(data.who).toHaveLength(0);
    expect(Array.isArray(data.locations)).toBe(true);
    expect(data.locations).toHaveLength(0);
  });

  it('fails when the target file already exists', async () => {
    const runNewCommand = await loadCommand<RunNewCommand>(
      'packages/wiki-cli/src/commands/new.ts',
      'runNewCommand',
    );
    const contentDir = await createTempContentDir();
    const templatesDir = getTemplatesDir();
    const targetPath = path.join(contentDir, 'characters', 'kael-nyx.md');
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, '---\n---\n', 'utf8');

    const result = assertCommandResult(
      await runNewCommand({
        type: 'character',
        id: 'kael-nyx',
        contentDir,
        templatesDir,
      }),
    );

    expect(result.exitCode).toBe(1);
  });
});
