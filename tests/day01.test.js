import assert from 'node:assert/strict';
import { parseInput, part1, part2 } from '../src/days/day01.js';
import { readInput } from '../src/lib/io.js';
import { test } from './test-helpers.js';

const exampleInput = `
L68
L30
R48
L5
R60
L55
L1
L99
R14
L82
`.trim();

test.skip('It starts at 50', () => {
  part1();
  assert.equal(part1('0'), 50);
});

test('It rotates left', () => {
  const input = parseInput('L42');
  assert.equal(part1(input), 8);
});

test('It rotates right', () => {
  const input = parseInput('R42');
  assert.equal(part1(input), 92);
});

test.skip('It solves Part 1', () => {
  const input = parseInput(readInput(exampleInput));
  assert.equal(part1(input), 3);
});
