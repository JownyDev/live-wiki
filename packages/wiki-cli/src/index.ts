#!/usr/bin/env node
import path from 'node:path';
import { runBuildCommand } from './commands/build';
import { runCheckCommand } from './commands/check';
import { runNewCommand } from './commands/new';
import {
  errorResult,
  failResult,
  formatErrorOutput,
  type CommandResult,
} from './commands/result';

const getDefaultContentDir = (): string => {
  return path.resolve(process.cwd(), 'content');
};

const getDefaultTemplatesDir = (): string => {
  return path.resolve(process.cwd(), 'templates');
};

const printResult = (result: CommandResult): void => {
  if (result.output) {
    const output =
      result.output.endsWith('\n') ? result.output : `${result.output}\n`;
    process.stdout.write(output);
  }
  process.exitCode = result.exitCode;
};

const runCommand = async (args: string[]): Promise<CommandResult> => {
  const [command, ...rest] = args;
  if (!command) {
    return failResult(formatErrorOutput('missing command'));
  }

  if (command === 'check') {
    const [contentDir] = rest;
    return await runCheckCommand({ contentDir });
  }

  if (command === 'build') {
    const contentDir = rest.at(0) ?? getDefaultContentDir();
    return await runBuildCommand({
      contentDir,
    });
  }

  if (command === 'new') {
    const [type, id] = rest;
    if (!type || !id) {
      return failResult(formatErrorOutput('missing type or id'));
    }
    return await runNewCommand({
      type,
      id,
      contentDir: getDefaultContentDir(),
      templatesDir: getDefaultTemplatesDir(),
    });
  }

  return failResult(formatErrorOutput(`unknown command ${command}`));
};

const main = async (): Promise<void> => {
  try {
    const result = await runCommand(process.argv.slice(2));
    printResult(result);
  } catch (error: unknown) {
    printResult(errorResult(error));
  }
};

void main();
