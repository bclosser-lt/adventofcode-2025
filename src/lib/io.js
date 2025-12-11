import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function getDayDirectory(day) {
  const numericDay = Number(day);
  if (!Number.isInteger(numericDay) || numericDay < 1 || numericDay > 25) {
    throw new Error(`Day must be between 1 and 25. Received: ${day}`);
  }

  return path.join(ROOT, `Day ${numericDay}`);
}

export function resolveDayFile(day, fileName = 'input.txt') {
  const suffix = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
  return path.join(getDayDirectory(day), suffix);
}

export function readInput(day, fileName = 'input.txt') {
  const filePath = resolveDayFile(day, fileName);
  const data = readFileSync(filePath, 'utf8');
  return data.replace(/\r\n/g, '\n');
}
