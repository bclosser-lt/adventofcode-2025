#!/usr/bin/env node
import { existsSync, readdirSync, watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { getRegisteredTests, resetTests } from '../tests/test-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(ROOT, 'tests');
const SRC_DIR = path.join(ROOT, 'src');

function collectTestFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

async function importTestFile(filePath) {
  resetTests();
  const moduleUrl = `${pathToFileURL(filePath).href}?update=${Date.now()}`;
  await import(moduleUrl);
  return getRegisteredTests();
}

function parseArgs(argv) {
  const watchMode = argv.includes('--watch') || argv.includes('-w');
  const cleanedArgs = argv.filter((arg) => arg !== '--watch' && arg !== '-w');
  return { watchMode, args: cleanedArgs };
}

function resolveExplicitFiles(args) {
  if (args.length === 0) {
    return null;
  }
  return args.map((arg) => path.resolve(process.cwd(), arg));
}

async function runSuite(explicitFiles) {
  const testFiles = explicitFiles ?? collectTestFiles(TESTS_DIR);
  if (testFiles.length === 0) {
    console.warn('No tests found.');
    return { passed: 0, failed: 0, skipped: 0, totalFiles: 0 };
  }
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const failures = [];

  for (const file of testFiles) {
    const relativeFile = path.relative(ROOT, file);
    const { tests, hasOnly } = await importTestFile(file);
    if (tests.length === 0) {
      console.warn(`[skip] ${relativeFile} (no tests registered)`);
      continue;
    }

    const runnable = [];
    for (const testCase of tests) {
      if (hasOnly) {
        if (testCase.only) {
          runnable.push(testCase);
        } else {
          skipped += 1;
        }
        continue;
      }

      if (testCase.skip) {
        skipped += 1;
        continue;
      }

      runnable.push(testCase);
    }

    if (runnable.length === 0) {
      console.warn(`[skip] ${relativeFile} (no runnable tests)`);
      continue;
    }

    for (const testCase of runnable) {
      const label = `${relativeFile} › ${testCase.name}`;
      const start = performance.now();
      try {
        await testCase.fn();
        passed += 1;
        const duration = performance.now() - start;
        console.log(`✓ ${label} (${duration.toFixed(2)}ms)`);
      } catch (error) {
        failed += 1;
        failures.push({ label, error });
        console.error(`✗ ${label}`);
        console.error(error.stack || error.message || error);
      }
    }
  }

  const summary = `${passed} passed, ${failed} failed, ${skipped} skipped`;
  const logFn = failed > 0 ? console.error : console.log;
  logFn(`\n${summary}`);

  return { passed, failed, skipped, totalFiles: testFiles.length };
}

function buildWatchTargets(explicitFiles) {
  const targets = new Set();
  if (explicitFiles) {
    for (const file of explicitFiles) {
      targets.add(file);
      targets.add(path.dirname(file));
    }
  }
  const defaultDirs = [
    TESTS_DIR,
    path.join(SRC_DIR, 'days'),
    path.join(SRC_DIR, 'lib'),
  ];
  for (const dir of defaultDirs) {
    targets.add(dir);
  }
  return [...targets];
}

async function main() {
  const { watchMode, args } = parseArgs(process.argv.slice(2));
  const explicitFiles = resolveExplicitFiles(args);

  async function execute(triggerLabel) {
    if (triggerLabel) {
      console.log(`[watch] Change detected (${triggerLabel}). Re-running tests...`);
    }
    const result = await runSuite(explicitFiles);
    if (!watchMode) {
      process.exitCode = result.failed > 0 ? 1 : 0;
    } else if (result.failed > 0) {
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  }

  let running = false;
  let queued = false;

  async function runWithQueue(triggerLabel) {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    try {
      await execute(triggerLabel);
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

  if (!watchMode) {
    return;
  }

  const watchTargets = buildWatchTargets(explicitFiles).filter((target) => existsSync(target));
  if (watchTargets.length === 0) {
    console.warn('Watch mode requested, but no watch targets exist. Exiting.');
    return;
  }

  console.log('Watch mode enabled. Press Ctrl+C to stop.');
  let debounceTimer;
  for (const target of watchTargets) {
    try {
      watch(target, { persistent: true }, (eventType, filename) => {
        const label = [path.relative(ROOT, target), filename].filter(Boolean).join('/');
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => runWithQueue(label || eventType), 75);
      });
    } catch (error) {
      console.warn(`Unable to watch ${target}: ${error.message}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
