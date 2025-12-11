/**
 * Day 2 solution.
 */
export const parseInput = (rawInput) => rawInput.trim().split(/\n+/);

export function part1(input) {
  let sum = 0;
  let invalidIDs = []
  let ranges = input[0].split(',');

  const checkID = (testRange) => {
    const startEnd = testRange.split("-");
    for (let id = parseInt(startEnd[0]); id <= parseInt(startEnd[1]); id++) {
      let check = id.toString();

      let pt1 = check.slice(0,check.length/2)
      let pt2 = check.slice(check.length/2)

      pt1 == pt2 ? invalidIDs.push(parseInt(check)) : null;

      check.startsWith(0) ? invalidIDs.push(parseInt(id)) : null;
    }
  }

  ranges.map((range) => checkID(range))
  
  invalidIDs.map((num) => sum+= num)
  
  return sum;
}

export function part2(input) {
  // TODO: implement part 2
  return input.length;
}
