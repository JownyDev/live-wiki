import { spawn } from 'node:child_process';
import path from 'node:path';
import { runCheckCommand, type CommandResult } from './check';

type RunCheckCommand = (options: { contentDir: string }) => Promise<CommandResult>;

type RunSiteBuild = (options: { projectRoot?: string }) => Promise<CommandResult>;

type BuildDeps = {
  runCheckCommand?: RunCheckCommand;
  runSiteBuild?: RunSiteBuild;
};

type BuildOptions = {
  contentDir: string;
  deps?: BuildDeps;
};

const runPnpmBuild = async (options: {
  projectRoot?: string;
}): Promise<CommandResult> => {
  const cwd = options.projectRoot ?? path.resolve(process.cwd());

  return await new Promise<CommandResult>((resolve) => {
    const child = spawn('pnpm', ['build'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on('error', (error: Error) => {
      resolve({ exitCode: 1, output: `Error: ${error.message}` });
    });
    child.on('close', (code: number | null) => {
      resolve({ exitCode: code ?? 1, output });
    });
  });
};

/**
 * Ejecuta `wiki check` y, si pasa, dispara el build del sitio.
 * @param options Directorio de contenido y dependencias inyectables.
 * @returns Resultado con exitCode 0/1 y salida acumulada.
 */
export const runBuildCommand = async (
  options: BuildOptions,
): Promise<CommandResult> => {
  const deps = options.deps ?? {};
  const check = deps.runCheckCommand ?? runCheckCommand;
  const build = deps.runSiteBuild ?? runPnpmBuild;

  const checkResult = await check({ contentDir: options.contentDir });
  if (checkResult.exitCode !== 0) {
    return {
      exitCode: 1,
      output: checkResult.output,
    };
  }

  return await build({ projectRoot: process.cwd() });
};
