/**
 * Day 1 solution.
 */
export const parseInput = (rawInput) => rawInput.trim().split(/\n+/);

export function part1(input) {
  const dial = Array.from(Array(100).keys());
  var pointingAt = dial[50];
  var zeroCount = 0;

  input.map((instruction) => {
    const move = parseInt(instruction.length < 4 ? instruction.slice(1) : instruction.slice(-2));
    switch (instruction.charAt(0)) {
      case 'L':
        dial[pointingAt - move] == undefined
          ? (pointingAt = dial[100 + (pointingAt - move)])
          : (pointingAt = dial[pointingAt - move]);
        break;
      case 'R':
        dial[pointingAt + move] == undefined
          ? (pointingAt = dial[Math.abs(100 - (pointingAt + move))])
          : (pointingAt = dial[pointingAt + move]);
        break;
    }
    if (pointingAt == 0) {
      zeroCount++;
    }
  });

  return zeroCount;
}

export function part2(input) {
  const dial = Array.from(Array(100).keys());
  var pointingAt = dial[50];
  var zeroCount = 0;

  input.map((instruction) => {
    const move = parseInt(instruction.length < 4 ? instruction.slice(1) : instruction.slice(-2));
    instruction.length > 3 ? (zeroCount += parseInt(instruction.slice(1, -2))) : true;
    switch (instruction.charAt(0)) {
      case 'L':
        switch (dial[pointingAt - move]) {
          case 0:
            pointingAt = dial[pointingAt - move];
            zeroCount++;
            // console.log("L to 0", zeroCount, pointingAt)
            break;
          case undefined:
            pointingAt == 0 ? null : zeroCount++;
            pointingAt = dial[100 + (pointingAt - move)];
            // console.log("L passes 0", zeroCount, pointingAt)
            break;
          default:
            pointingAt = dial[pointingAt - move];
            // console.log("L move", zeroCount, pointingAt)
            break;
        }
        break;
      case 'R':
        switch (dial[pointingAt + move]) {
          case 0:
            pointingAt = dial[pointingAt + move];
            zeroCount++;
            // console.log("R to 0", zeroCount, pointingAt)
            break;
          case undefined:
            pointingAt == 0 ? null : zeroCount++;
            pointingAt = dial[Math.abs(100 - (pointingAt + move))];
            // console.log("R passes 0", zeroCount, pointingAt)
            break;
          default:
            pointingAt = dial[pointingAt + move];
            // console.log("R move", zeroCount, pointingAt)
            break;
        }
        break;
    }
  });

  return zeroCount;
}
