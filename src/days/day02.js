/**
 * Day 2 solution.
 */
export const parseInput = (rawInput) => rawInput.trim().split(/\n+/);

export function part1(input) {
  let sum = 0;
  let ranges = input[0].split(',');

  const checkId = (testRange) => {
    const startEnd = testRange.split("-");
    for (let id = parseInt(startEnd[0]); id <= parseInt(startEnd[1]); id++) {
      let check = id.toString();

      // IDs that have un-even splits can be skipped
      if (check.length % 2 === 0) {
  
        let pt1 = check.slice(0, check.length / 2);
        let pt2 = check.slice(check.length / 2);
  
        if (pt1 === pt2) {
          sum += id;
          continue;
        }

      }

    }
    
  }

  ranges.forEach((range) => {checkId(range)})

  return sum;
}

export function part2(input) {
  // TODO: implement part 2
  return input.length;
}
