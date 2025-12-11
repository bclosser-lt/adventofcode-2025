# Advent of Code 2025 (Node.js workspace)

This repository is now wired for solving the daily Advent of Code puzzles with modern Node.js. Each puzzle input already lives in the provided `Day N` folders, while code you write resides under `src/`.

## Layout

- `Day N/input.txt` – official puzzle inputs (and any other text files you add per day).
- `src/days/dayXX.js` – JavaScript solutions where `XX` is a zero-padded day number.
- `src/lib/io.js` – helper that reads the right input file for a day.
- `scripts/run-day.js` – CLI runner used by `npm run day` to execute one or both parts.
- `scripts/new-day.js` – scaffolds a new solution file with a minimal template.

## Creating a solution file

```bash
npm run new:day -- 5   # creates src/days/day05.js
```

Each generated file exports:

```js
export const parseInput = (rawInput) => rawInput.trim().split(/\n+/);
export function part1(input) { /* ... */ }
export function part2(input) { /* ... */ }
```

- `parseInput` runs before every part (so you can safely mutate its return value inside `part1`/`part2`).
- The runner automatically passes the contents of `Day N/input.txt` unless you specify another text file.

Feel free to delete or adapt the template body once you start solving.

## Running solutions

```bash
npm run day -- 1             # run day 1, both parts, using Day 1/input.txt
npm run day -- 2 1           # run only part 1 of day 2
npm run day -- 3 all test    # run both parts of day 3 with Day 3/test.txt
npm run day -- 4 --watch     # watch src/days/day04.js and re-run on save
```

The CLI reports each part's answer and execution time. Add `--watch` (or `-w`) to keep the process running; it will re-import your solution file (cache busting included) whenever it changes. If a part isn't implemented yet, you'll get a helpful warning instead of a crash.

## Testing solutions

`npm test` runs the lightweight runner in `scripts/run-tests.js`, which loads every `tests/**/*.test.js` file (or only the paths you pass after `--`) and executes the registered tests sequentially. Each time you scaffold a new day, `tests/dayXX.test.js` is added with `test.skip` placeholders for example- and input-based assertions—remove the skips once you have real expectations.

Each test file imports the helper API:

```js
import assert from 'node:assert/strict';
import { parseInput, part1, part2 } from '../src/days/day01.js';
import { readInput } from '../src/lib/io.js';
import { test } from './test-helpers.js';

const exampleInput = `...`.trim();

test.skip('day 1 part 1 example', () => {
  const input = parseInput(exampleInput);
  assert.equal(part1(input), 3);
});
```

- `test.skip` leaves a placeholder without failing the suite.
- `test.only` focuses on specific cases.
- Run a subset via `npm test -- tests/day05.test.js`.
- Add `--watch` (or `-w`) to keep the runner alive; it watches the `tests/` directory plus `src/days`/`src/lib` and reruns whenever files change. Example: `npm test -- --watch` or `npm test -- tests/day05.test.js --watch`.

## Reading alternate inputs

Use the helper if you ever need to load files manually:

```js
import { readInput } from '../lib/io.js';

const raw = readInput(5, 'example'); // Day 5/example.txt
```

This keeps all file-path logic in one place and normalizes Windows vs. Unix newlines.

## Next steps

1. Generate the starter file for each day you plan to tackle (`npm run new:day -- <day>`).
2. Implement `part1` and `part2` for that day, using `parseInput` to shape the raw data.
3. Run `npm run day -- <day>` as you iterate.

Happy puzzling!
