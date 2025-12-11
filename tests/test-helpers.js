const state = {
  tests: [],
  hasOnly: false,
};

function register(name, fn, options = {}) {
  state.tests.push({ name, fn, ...options });
  if (options.only) {
    state.hasOnly = true;
  }
}

export function test(name, fn) {
  register(name, fn);
}

test.skip = (name, fn) => {
  register(name, fn, { skip: true });
};

test.only = (name, fn) => {
  register(name, fn, { only: true });
};

export function getRegisteredTests() {
  return {
    tests: state.tests.slice(),
    hasOnly: state.hasOnly,
  };
}

export function resetTests() {
  state.tests = [];
  state.hasOnly = false;
}
