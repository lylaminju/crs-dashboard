const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const paths = {
  html: path.join(root, "index.html"),
  css: path.join(root, "styles.css"),
  app: path.join(root, "app.js"),
  analytics: path.join(root, "analytics.js"),
  sourceIcon: path.join(root, "assets/link-outline.svg"),
  sourceIconBlue: path.join(root, "assets/link-outline-blue.svg")
};

const html = fs.readFileSync(paths.html, "utf8");
const css = fs.readFileSync(paths.css, "utf8");
const script = fs.readFileSync(paths.app, "utf8");
const analytics = fs.readFileSync(paths.analytics, "utf8");

delete globalThis.CRS_DASHBOARD;
new Function(script)();

const api = globalThis.CRS_DASHBOARD;

function fixtureState(overrides = {}) {
  return { ...api.DEFAULT_STATE, ...overrides };
}

function languageFixture(prefix, test, score) {
  return {
    [`${prefix}Test`]: test,
    [`${prefix}Listening`]: score,
    [`${prefix}Reading`]: score,
    [`${prefix}Writing`]: score,
    [`${prefix}Speaking`]: score
  };
}

function baseScoringState(overrides = {}) {
  return fixtureState({
    maritalStatus: "single",
    age: "30",
    education: "lessSecondary",
    ...languageFixture("first", "celpip", "A"),
    ...languageFixture("second", "none", "none"),
    canadianWork: "0",
    foreignWork: "0",
    canadianEducation: "none",
    sibling: false,
    nomination: false,
    certificate: false,
    spouseEducation: "lessSecondary",
    ...languageFixture("spouse", "none", "none"),
    spouseCanadianWork: "0",
    ...overrides
  });
}

function scenarioById(state, id) {
  const definition = api.scenarioDefinitions(state).find((scenario) => scenario.id === id);
  assert.ok(definition, `Missing scenario definition: ${id}`);
  return api.buildScenario(state, definition);
}

function componentDeltaByLabel(scenario, label) {
  const row = scenario.componentDeltas.find(([rowLabel]) => rowLabel === label);
  return row ? row[1] : 0;
}

function assertIncludes(haystack, needle, message) {
  assert.ok(haystack.includes(needle), message || `Expected text to include: ${needle}`);
}

function assertNotIncludes(haystack, needle, message) {
  assert.ok(!haystack.includes(needle), message || `Expected text not to include: ${needle}`);
}

function assertInOrder(haystack, labels, message) {
  const indexes = labels.map((label) => haystack.indexOf(label));
  assert.ok(indexes.every((index) => index !== -1), `${message}: missing item`);
  assert.ok(
    indexes.every((index, position) => position === 0 || indexes[position - 1] < index),
    message
  );
}

module.exports = {
  api,
  analytics,
  assertInOrder,
  assertIncludes,
  assertNotIncludes,
  baseScoringState,
  componentDeltaByLabel,
  css,
  fixtureState,
  fs,
  html,
  languageFixture,
  paths,
  scenarioById,
  script
};
