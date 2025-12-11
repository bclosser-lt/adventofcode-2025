#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAYS_DIR = path.resolve(__dirname, '../src/days');
const TESTS_DIR = path.resolve(__dirname, '../tests');

function usage(message) {
  if (message) {
    console.error(message);
  }
  console.error('Usage: npm run new:day -- <day>');
  process.exit(1);
}

function normalizeDay(input) {
  const day = Number(input);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    usage(`Invalid day provided: ${input}`);
  }
  return day;
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function buildSolutionTemplate(day) {
  return `/**
 * Day ${day} solution.
 */
export const parseInput = (rawInput) => rawInput.trim().split(/\\n+/);

export function part1(input) {
  // TODO: implement part 1
  return input.length;
}

export function part2(input) {
  // TODO: implement part 2
  return input.length;
}
`;
}

function buildTestTemplate(day) {
  const dayLabel = String(day).padStart(2, '0');
  return `import assert from 'node:assert/strict';
import { parseInput, part1, part2 } from '../src/days/day${dayLabel}.js';
import { readInput } from '../src/lib/io.js';
import { test } from './test-helpers.js';

const exampleInput = \`
\`.trim();

test.skip('day ${day} part 1 example', () => {
  const input = parseInput(exampleInput);
  assert.equal(part1(input), 'TODO');
});

test.skip('day ${day} part 2 example', () => {
  const input = parseInput(exampleInput);
  assert.equal(part2(input), 'TODO');
});

test.skip('day ${day} part 1 answer', () => {
  const input = parseInput(readInput(${day}));
  assert.equal(part1(input), 'TODO');
});

test.skip('day ${day} part 2 answer', () => {
  const input = parseInput(readInput(${day}));
  assert.equal(part2(input), 'TODO');
});
`;
}

function main() {
  const [dayArg] = process.argv.slice(2);
  if (!dayArg) {
    usage('Please provide a day number.');
  }

  ensureDir(DAYS_DIR);
  ensureDir(TESTS_DIR);

  const day = normalizeDay(dayArg);
  const fileName = `day${String(day).padStart(2, '0')}.js`;
  const destination = path.join(DAYS_DIR, fileName);

  if (existsSync(destination)) {
    usage(`Solution file already exists: ${destination}`);
  }

  writeFileSync(destination, buildSolutionTemplate(day), 'utf8');
  console.log(`Created ${path.relative(process.cwd(), destination)}`);

  const testFileName = `day${String(day).padStart(2, '0')}.test.js`;
  const testDestination = path.join(TESTS_DIR, testFileName);
  if (!existsSync(testDestination)) {
    writeFileSync(testDestination, buildTestTemplate(day), 'utf8');
    console.log(`Created ${path.relative(process.cwd(), testDestination)}`);
  } else {
    console.log(`Test file already exists: ${path.relative(process.cwd(), testDestination)}`);
  }
}

main();
