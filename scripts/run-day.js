#!/usr/bin/env node
import { existsSync, watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { readInput } from '../src/lib/io.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DAYS_DIR = path.join(ROOT, 'src/days');

function usage(message) {
  if (message) {
    console.error(message);
  }
  console.error('Usage: npm run day -- <day> [part] [inputFile] [--watch|-w]');
  console.error('  <day>: numeric day between 1 and 25');
  console.error('  [part]: 1, 2, or "all" (default)');
  console.error('  [inputFile]: defaults to input.txt (omit .txt extension to use custom files)');
  console.error('  [--watch|-w]: re-run when the solution file changes');
  process.exit(1);
}

function normalizeDay(value) {
  const day = Number(value);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    usage(`Invalid day provided: ${value}`);
  }
  return day;
}

function normalizePart(value) {
  if (!value || value === 'all') {
    return [1, 2];
  }

  const part = Number(value);
  if (part === 1) return [1];
  if (part === 2) return [2];

  usage(`Invalid part provided: ${value}`);
}

function normalizeInputFile(value) {
  if (!value) return 'input.txt';
  return value.endsWith('.txt') ? value : `${value}.txt`;
}

function extractArgs(args) {
  const watchMode = args.includes('--watch') || args.includes('-w');
  const cleanedArgs = args.filter((value) => value !== '--watch' && value !== '-w');
  return { watchMode, cleanedArgs };
}

async function runSolution({ day, parts, requestedInput, moduleUrl }) {
  const solutionModule = await import(`${moduleUrl}?update=${Date.now()}`);
  const { parseInput } = solutionModule;
  const rawInput = readInput(day, requestedInput);

  for (const part of parts) {
    const runner = solutionModule[`part${part}`];
    if (typeof runner !== 'function') {
      console.warn(`Part ${part} is not implemented for day ${day}.`);
      continue;
    }

    const preparedInput = typeof parseInput === 'function' ? parseInput(rawInput) : rawInput;
    const start = performance.now();
    const answer = await runner(preparedInput);
    const duration = performance.now() - start;
    console.log(`Day ${day} Part ${part}: ${answer} (${duration.toFixed(2)}ms)`);
  }
}

async function main() {
  const { watchMode, cleanedArgs } = extractArgs(process.argv.slice(2));
  const [dayArg, partArg, fileArg] = cleanedArgs;
  if (!dayArg) {
    usage('Please provide a day number.');
  }

  const day = normalizeDay(dayArg);
  const parts = normalizePart(partArg);
  const requestedInput = normalizeInputFile(fileArg);
  const moduleName = `day${String(day).padStart(2, '0')}.js`;
  const modulePath = path.join(DAYS_DIR, moduleName);

  if (!existsSync(modulePath)) {
    usage(`Could not find solution module at ${path.relative(ROOT, modulePath)}`);
  }

  const moduleUrl = pathToFileURL(modulePath).href;
  const runContext = { day, parts, requestedInput, moduleUrl };

  let running = false;
  let queued = false;

  async function runWithQueue(triggerSource) {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    if (triggerSource) {
      console.log(`[watch] Change detected (${triggerSource}). Re-running...`);
    }
    try {
      await runSolution(runContext);
    } catch (error) {
      console.error(error);
    } finally {
      running = false;
      if (queued) {
        queued = false;
        runWithQueue('queued change');
      }
    }
  }

  await runWithQueue();

  if (watchMode) {
    console.log(`Watching ${path.relative(ROOT, modulePath)} for changes...`);
    let debounceTimer;
    watch(modulePath, { persistent: true }, (eventType) => {
      if (!existsSync(modulePath)) {
        console.warn(`Solution file ${modulePath} is missing. Waiting for it to reappear...`);
        return;
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runWithQueue(eventType), 75);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
